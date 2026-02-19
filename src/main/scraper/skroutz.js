/**
 * skroutz.js - Skroutz scraper (primary source)
 * Returns the LOWEST price shown on the product page.
 */

const { newStealthPage, humanDelay } = require('./stealth')
const { parsePrice, isPlausiblePrice } = require('./priceUtils')

const SKROUTZ_BASE = 'https://www.skroutz.gr'

async function scrapeSkroutz (query, timeoutMs = 20000) {
  let ctx = null

  try {
    const { page, ctx: context } = await newStealthPage(timeoutMs)
    ctx = context

    // ── Search ───────────────────────────────────────────────────────────────
    const searchUrl = `${SKROUTZ_BASE}/search?keyphrase=${encodeURIComponent(query)}`
    console.log(`[Skroutz] Searching: ${searchUrl}`)

    const response = await page.goto(searchUrl, { waitUntil: 'domcontentloaded' })

    if (response && response.status() === 404) {
      console.log('[Skroutz] 404 on search.')
      return null
    }

    await humanDelay(800, 1400)

    // Check for no results
    const noResults = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase()
      return text.includes('δεν βρέθηκαν') ||
             text.includes('no results') ||
             text.includes('0 αποτελέσματα')
    })
    if (noResults) {
      console.log('[Skroutz] No results.')
      return null
    }

    // ── Navigate to first product ────────────────────────────────────────────
    const currentUrl = page.url()

    // If search redirected directly to product page
    const isProductPage = currentUrl.includes('/s/') || currentUrl.includes('/p/')

    if (!isProductPage) {
      // Find first product card link
      const firstLink = await page.evaluate(() => {
        const selectors = [
          'li.card a.js-sku-link',
          'li.card a[href*="/s/"]',
          '.card a[href*="/s/"]',
          'a[href*="/s/"][class*="card"]',
          '.sku-card a',
          'ul.cf li:first-child a'
        ]
        for (const sel of selectors) {
          const el = document.querySelector(sel)
          if (el && el.href) return el.href
        }
        // Fallback: any link with /s/ in href
        const links = Array.from(document.querySelectorAll('a[href*="/s/"]'))
        return links.length ? links[0].href : null
      })

      if (!firstLink) {
        console.log('[Skroutz] Could not find product link.')
        return null
      }

      await page.goto(firstLink, { waitUntil: 'domcontentloaded' })
      await humanDelay(700, 1200)
    }

    // ── Extract product name ─────────────────────────────────────────────────
    const productName = await page.evaluate(() => {
      const el = document.querySelector('h1[class*="title"], h1.sku-title, h1')
      return el ? el.innerText.trim() : null
    }).catch(() => query)

    // ── Extract prices from shop listing ────────────────────────────────────
    // Skroutz shows a list of shops with prices — we want the lowest VALID one
    const price = await page.evaluate(() => {
      // Try the price list table (most reliable)
      const priceEls = Array.from(document.querySelectorAll([
        '.js-sku-product-link .price',
        'tr.retailer td.price',
        '.retailers-list .price',
        '[data-price]',
        '.sku-product-price',
        'strong.price',
        '.price-current',
        '.main-price'
      ].join(',')))

      const prices = priceEls
        .map(el => {
          const txt = el.getAttribute('data-price') || el.innerText
          // Greek format: 1.299,90 € → remove dots, replace comma
          const clean = txt.replace(/\s/g,'').replace('€','')
                           .replace(/\./g,'').replace(',','.')
          return parseFloat(clean)
        })
        .filter(n => !isNaN(n) && n > 2 && n < 99999)

      return prices.length ? Math.min(...prices) : null
    })

    // Validate
    if (!price || !isPlausiblePrice(price)) {
      // Fallback: try meta/JSON-LD
      const metaPrice = await page.evaluate(() => {
        try {
          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          for (const s of scripts) {
            const d = JSON.parse(s.textContent)
            const obj = Array.isArray(d) ? d[0] : d
            if (obj.offers) {
              const o = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers
              if (o.price) return parseFloat(o.price)
              if (o.lowPrice) return parseFloat(o.lowPrice)
            }
          }
        } catch {}
        return null
      })

      if (!metaPrice || !isPlausiblePrice(metaPrice)) {
        console.log('[Skroutz] Could not extract valid price.')
        return null
      }

      console.log(`[Skroutz] Found (meta): ${productName} @ €${metaPrice}`)
      const { includes_shipping, shipping_note } = await extractShippingInfo(page)
      return {
        shop_name: 'Skroutz',
        shop_url:  page.url(),
        price: metaPrice,
        productName: productName || query,
        includes_shipping,
        shipping_note
      }
    }

    const { includes_shipping, shipping_note } = await extractShippingInfo(page)
    console.log(`[Skroutz] Found: ${productName} @ €${price}`)

    return {
      shop_name: 'Skroutz',
      shop_url:  page.url(),
      price,
      productName: productName || query,
      includes_shipping,
      shipping_note
    }

  } catch (err) {
    console.error('[Skroutz] Error:', err.message)
    return null
  } finally {
    if (ctx) await ctx.close().catch(() => {})
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


async function extractShippingInfo (page) {
  try {
    const text = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll(
        '[class*="shipping"], [class*="delivery"], [class*="transport"]'
      ))
      return els.map(el => el.innerText.trim()).join(' | ')
    })
    if (!text) return { includes_shipping: 0, shipping_note: null }
    const lower = text.toLowerCase()
    if (lower.includes('δωρεάν') || lower.includes('free')) {
      return { includes_shipping: 1, shipping_note: 'Δωρεάν αποστολή (Skroutz)' }
    }
    if (lower.includes('αποστολ') || lower.includes('μεταφορ')) {
      return { includes_shipping: 1, shipping_note: text.slice(0, 80) }
    }
    return { includes_shipping: 0, shipping_note: null }
  } catch {
    return { includes_shipping: 0, shipping_note: null }
  }
}

module.exports = { scrapeSkroutz }
