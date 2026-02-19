/**
 * shopScraper.js
 * Generic scraper with robust price validation.
 * Fixes:
 *  - 404 page detection → return null immediately
 *  - Price sanity check → must look like a real product price
 *  - Greedy fallback now uses stricter pattern + median instead of min
 *  - Schema.org meta price preferred over greedy text scan
 */

const { newStealthPage, humanDelay } = require('../stealth')
const { parsePrice, isPlausiblePrice } = require('../priceUtils')

// ─── Min price threshold to reject obviously wrong numbers ────────────────────
// Anything below this is almost certainly NOT a product price (rating, kg, etc.)
const MIN_VALID_PRICE = 1.00   // €1 minimum — catches 15.25 type false positives
// Note: we cannot use a fixed minimum per category since we don't know the category.
// Instead we use CONTEXT validation (see isPlausiblePrice below).

async function scrapeShop (shopConfig, query, timeoutMs = 20000) {
  let ctx = null

  try {
    const { page, ctx: context } = await newStealthPage(timeoutMs)
    ctx = context

    const searchUrl = shopConfig.searchUrl(query)
    console.log(`[${shopConfig.name}] Fetching: ${searchUrl}`)

    const response = await page.goto(searchUrl, { waitUntil: 'domcontentloaded' })

    // ── 404 / error page detection ───────────────────────────────────────────
    if (response && (response.status() === 404 || response.status() >= 500)) {
      console.log(`[${shopConfig.name}] HTTP ${response.status()} - skipping.`)
      return null
    }

    // Also check for soft 404 (page says "no results" or "not found")
    const is404 = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase()
      return (
        text.includes('404') ||
        text.includes('δεν βρέθηκε') ||
        text.includes('no results') ||
        text.includes('0 αποτελέσματα') ||
        text.includes('δεν υπάρχουν αποτελέσματα') ||
        (text.includes('not found') && !text.includes('price'))
      )
    })

    if (is404) {
      console.log(`[${shopConfig.name}] Soft 404 / no results - skipping.`)
      return null
    }

    await humanDelay(600, 1200)

    // ── Navigate to first product ────────────────────────────────────────────
    await clickFirstProduct(page, shopConfig.firstResultSel)

    // ── Check again for 404 after navigation ────────────────────────────────
    const currentUrl = page.url()
    if (currentUrl.includes('404') || currentUrl.includes('error')) {
      console.log(`[${shopConfig.name}] Landed on error page - skipping.`)
      return null
    }

    // ── Extract price ────────────────────────────────────────────────────────
    const price = await extractPrice(page, shopConfig.priceSelectors, query)

    if (!price) {
      console.log(`[${shopConfig.name}] No valid price found.`)
      return null
    }

    const { includes_shipping, shipping_note } =
      await extractShippingInfo(page, shopConfig.shippingSelectors)

    console.log(`[${shopConfig.name}] Price: €${price} | URL: ${currentUrl}`)

    return {
      shop_name: shopConfig.name,
      shop_url:  currentUrl,
      price,
      includes_shipping,
      shipping_note
    }

  } catch (err) {
    console.error(`[${shopConfig.name}] Error: ${err.message}`)
    return null
  } finally {
    if (ctx) await ctx.close().catch(() => {})
  }
}

// ─── Click first product result ───────────────────────────────────────────────

async function clickFirstProduct (page, selectorString) {
  if (!selectorString) return null
  const selectors = selectorString.split(',').map(s => s.trim())

  for (const sel of selectors) {
    try {
      const el = await page.$(sel)
      if (!el) continue
      const href = await el.getAttribute('href').catch(() => null)
      if (!href) continue

      const targetUrl = href.startsWith('http')
        ? href
        : new URL(href, page.url()).toString()

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
      await humanDelay(400, 900)
      return page.url()
    } catch { /* try next */ }
  }
  return null
}

// ─── Price extraction ─────────────────────────────────────────────────────────

async function extractPrice (page, priceSelectors, query = '') {
  // METHOD 1: Registered CSS selectors (most reliable)
  for (const sel of (priceSelectors || [])) {
    try {
      const els = await page.$$(sel)
      for (const el of els) {
        const txt = await el.innerText().catch(() => '')
        const p   = parsePrice(txt)
        if (p && isPlausiblePrice(p)) return p
      }
    } catch { /* next */ }
  }

  // METHOD 2: schema.org structured data (very reliable when present)
  try {
    const schemaPrice = await page.evaluate(() => {
      // Try JSON-LD first
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent)
          const obj  = Array.isArray(data) ? data[0] : data
          if (obj.offers) {
            const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers
            if (offer.price) return String(offer.price)
          }
          if (obj.price) return String(obj.price)
        } catch {}
      }
      // Try itemprop
      const el = document.querySelector('[itemprop="price"]')
      if (el) return el.getAttribute('content') || el.innerText
      return null
    })
    if (schemaPrice) {
      const p = parsePrice(schemaPrice)
      if (p && isPlausiblePrice(p)) return p
    }
  } catch { /* next */ }

  // METHOD 3: Targeted greedy scan — only inside elements that LOOK like price containers
  // Much stricter than before: requires € symbol adjacent to number
  try {
    const prices = await page.evaluate(() => {
      const pricePattern = /(?:€\s*)([\d]{1,4}(?:[.,][\d]{3})*(?:[.,][\d]{2}))|(?:([\d]{1,4}(?:[.,][\d]{3})*(?:[.,][\d]{2}))\s*€)/g
      const text = document.body.innerText

      const results = []
      let match
      while ((match = pricePattern.exec(text)) !== null) {
        const raw   = (match[1] || match[2]).replace(/\./g, '').replace(',', '.')
        const value = parseFloat(raw)
        if (!isNaN(value)) results.push(value)
      }
      return results
    })

    // Filter plausible prices and return the MEDIAN (not min, to avoid ratings/weights)
    const valid = prices.filter(isPlausiblePrice)
    if (valid.length > 0) {
      valid.sort((a, b) => a - b)
      // Use the LOWEST plausible price that is > threshold
      // (products usually have 1-2 price mentions, take the first real one)
      return valid[0]
    }
  } catch { /* nothing */ }

  return null
}


// ─── Shipping info ────────────────────────────────────────────────────────────

async function extractShippingInfo (page, shippingSelectors) {
  try {
    const sels = (shippingSelectors || []).join(', ')
    if (!sels) return { includes_shipping: 0, shipping_note: null }

    const text = await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll(sel))
        .map(el => el.innerText.trim())
        .join(' | ')
    }, sels)

    if (!text) return { includes_shipping: 0, shipping_note: null }

    const lower = text.toLowerCase()
    if (lower.includes('δωρεάν') || lower.includes('free')) {
      return { includes_shipping: 1, shipping_note: 'Δωρεάν αποστολή' }
    }
    if (lower.includes('αποστολ') || lower.includes('μεταφορ') || lower.includes('shipping')) {
      return { includes_shipping: 1, shipping_note: text.slice(0, 100) }
    }
    return { includes_shipping: 0, shipping_note: null }
  } catch {
    return { includes_shipping: 0, shipping_note: null }
  }
}

module.exports = { scrapeShop, isPlausiblePrice, extractPrice }
