/**
 * engine.js
 * Scraping orchestrator.
 *
 * Logic:
 *  1. Check cache first (TTL = 60 min by default)
 *  2. Scrape Skroutz (parallel with shop scraping)
 *  3. Scrape shops in fallback order — stop when we have 2 successful results
 *  4. If Skroutz failed → need 3 shop results instead of 2
 *  5. Save to cache
 *  6. Return structured result
 */

const { scrapeSkroutz }   = require('./skroutz')
const { scrapeShop }      = require('./shops/shopScraper')
const { getShopsByPriority } = require('./shops/registry')
const db                  = require('../db/database')

const CACHE_TTL_MIN = 60

/**
 * Main entry point.
 * @param {string} query       - barcode or product name
 * @param {function} onProgress - callback(message) for UI progress updates
 * @returns {object} { skroutzResult, shopResults, allPrices, warnings }
 */
async function fetchPrices (query, onProgress = () => {}) {
  const normalized = query.trim()

  // ── 1. Cache check ─────────────────────────────────────────────────────────
  const useCacheSetting = db.getSetting('use_cache')
  if (useCacheSetting === '1') {
    const cached = db.getCached(normalized, CACHE_TTL_MIN)
    if (cached && cached.length >= 3) {
      console.log('[Engine] Returning cached results.')
      onProgress('Αποτελέσματα από cache.')
      return formatCachedResults(cached)
    }
  }

  const warnings     = []
  const shopsByPrio  = getShopsByPriority()

  // ── 2. Parallel: Skroutz + first 2 Tier-A shops ────────────────────────────
  onProgress('Αναζήτηση στο Skroutz...')

  const timeoutMs = parseInt(db.getSetting('scrape_timeout_ms') || '20000')

  // Start Skroutz immediately
  const skroutzPromise = scrapeSkroutz(normalized, timeoutMs)
    .catch(err => {
      console.error('[Engine] Skroutz failed:', err.message)
      return null
    })

  // Start 2 Tier-A shops in parallel
  const tierAShops = shopsByPrio.filter(s => s.tier === 'A').slice(0, 2)
  onProgress(`Αναζήτηση σε ${tierAShops.map(s => s.name).join(', ')}...`)

  const tierAPromises = tierAShops.map(shop =>
    scrapeShop(shop, normalized, timeoutMs).catch(() => null)
  )

  const [skroutzResult, ...initialShopResults] = await Promise.all([
    skroutzPromise,
    ...tierAPromises
  ])

  const validShopResults = initialShopResults.filter(Boolean)

  // ── 3. Determine how many more shops we need ─────────────────────────────
  const needShops   = skroutzResult ? 2 : 3
  const haveShops   = validShopResults.length
  let   remaining   = needShops - haveShops

  // ── 4. Fallback to more shops if needed ───────────────────────────────────
  if (remaining > 0) {
    const alreadyTried  = new Set(tierAShops.map(s => s.name))
    const fallbackShops = shopsByPrio.filter(s => !alreadyTried.has(s.name))

    for (const shop of fallbackShops) {
      if (remaining <= 0) break

      onProgress(`Fallback: αναζήτηση στο ${shop.name}...`)
      const result = await scrapeShop(shop, normalized, timeoutMs).catch(() => null)
      if (result) {
        validShopResults.push(result)
        remaining--
      }
    }
  }

  // ── 5. Build warnings ─────────────────────────────────────────────────────
  if (!skroutzResult) {
    warnings.push({ type: 'info', message: 'Το προϊόν δεν βρέθηκε στο Skroutz.' })
  }

  const allResults = [
    ...(skroutzResult ? [skroutzResult] : []),
    ...validShopResults
  ]

  allResults.forEach(r => {
    if (!r.includes_shipping) {
      warnings.push({
        type:    'warning',
        message: `${r.shop_name}: Δεν είναι διαθέσιμα μεταφορικά.`
      })
    } else if (r.shipping_note) {
      warnings.push({
        type:    'info',
        message: `${r.shop_name}: ${r.shipping_note}`
      })
    }
  })

  if (allResults.length < 2) {
    warnings.push({
      type:    'error',
      message: 'Βρέθηκαν πολύ λίγες τιμές. Δοκιμάστε διαφορετικό όνομα/barcode.'
    })
  }

  // ── 6. Save to cache ──────────────────────────────────────────────────────
  if (allResults.length > 0) {
    db.saveCache(normalized, allResults)
  }

  // ── 7. Format & return ────────────────────────────────────────────────────
  const allPrices = allResults.map(r => r.price).filter(Boolean)

  return {
    query:         normalized,
    skroutzResult,
    shopResults:   validShopResults,
    allResults,
    allPrices,
    warnings,
    fromCache:     false
  }
}

// ─── Format cached results ────────────────────────────────────────────────────

function formatCachedResults (cachedRows) {
  const skroutzResult = cachedRows.find(r => r.shop_name === 'Skroutz') || null
  const shopResults   = cachedRows.filter(r => r.shop_name !== 'Skroutz')
  const allResults    = cachedRows
  const allPrices     = allResults.map(r => r.price).filter(Boolean)

  const warnings = []
  allResults.forEach(r => {
    if (!r.includes_shipping) {
      warnings.push({
        type:    'warning',
        message: `${r.shop_name}: Δεν είναι διαθέσιμα μεταφορικά.`
      })
    } else if (r.shipping_note) {
      warnings.push({
        type:    'info',
        message: `${r.shop_name}: ${r.shipping_note}`
      })
    }
  })

  return {
    query:         cachedRows[0]?.search_query || '',
    skroutzResult: skroutzResult
      ? { ...skroutzResult, shop_name: 'Skroutz' }
      : null,
    shopResults,
    allResults,
    allPrices,
    warnings,
    fromCache: true
  }
}

module.exports = { fetchPrices }
