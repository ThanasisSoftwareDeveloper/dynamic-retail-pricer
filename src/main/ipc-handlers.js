/**
 * ipc-handlers.js
 * Registers all IPC handlers for the main process.
 */

const { ipcMain, shell } = require('electron')
const db                 = require('./db/database')
const { fetchPrices }    = require('./scraper/engine')
const { recommendedPrice, marketStats, getApplicableMarkup } =
  require('./pricing/calculator')

module.exports = function registerHandlers (mainWindow) {

  // ── Search & Price Calculation ───────────────────────────────────────────────
  ipcMain.handle('search:prices', async (_event, { query, costNoVat }) => {
    try {
      // Progress updates → renderer
      const onProgress = (msg) => {
        mainWindow.webContents.send('search:progress', msg)
      }

      onProgress('Ξεκινά η αναζήτηση...')

      // Fetch market prices
      const scrapeResult = await fetchPrices(query, onProgress)

      // Get applicable markup
      const rules     = db.getMarkupRules()
      const markupPct = getApplicableMarkup(costNoVat, rules)

      // Market stats
      const stats = marketStats(scrapeResult.allPrices)

      // Recommended price
      const skroutzPrice  = scrapeResult.skroutzResult?.price || null
      const priceCalc     = recommendedPrice({
        costNoVat,
        markupPct,
        skroutzPrice,
        marketPrices:    scrapeResult.allPrices,
        skroutzAbovePct: parseFloat(db.getSetting('skroutz_above_pct') || '2')
      })

      // Save to history
      db.saveHistory({
        search_query:       query,
        product_name:       scrapeResult.skroutzResult?.productName || query,
        cost_no_vat:        costNoVat,
        markup_pct:         markupPct,
        recommended_price:  priceCalc.recommendedPrice,
        min_market_price:   stats.min,
        max_market_price:   stats.max,
        avg_market_price:   stats.avg,
        skroutz_price:      skroutzPrice,
        prices:             scrapeResult.allResults.map(r => ({
          shop:  r.shop_name,
          price: r.price,
          url:   r.shop_url
        }))
      })

      return {
        ok: true,
        query,
        costNoVat,
        markupPct,
        rules,
        priceCalc,
        stats,
        scrapeResult,
        productName: scrapeResult.skroutzResult?.productName || query
      }

    } catch (err) {
      console.error('[IPC search:prices]', err)
      return { ok: false, error: err.message }
    }
  })

  // ── Markup Rules ──────────────────────────────────────────────────────────────
  ipcMain.handle('markup:getRules', () => {
    return db.getMarkupRules()
  })

  ipcMain.handle('markup:saveRules', (_event, rules) => {
    db.saveMarkupRules(rules)
    return { ok: true }
  })

  // ── History ───────────────────────────────────────────────────────────────────
  ipcMain.handle('history:get', (_event, limit = 50) => {
    return db.getHistory(limit)
  })

  // ── Settings ──────────────────────────────────────────────────────────────────
  ipcMain.handle('settings:getAll', () => {
    return db.getAllSettings()
  })

  ipcMain.handle('settings:save', (_event, { key, value }) => {
    db.setSetting(key, value)
    return { ok: true }
  })

  // ── Shell ─────────────────────────────────────────────────────────────────────
  ipcMain.handle('shell:openExternal', (_event, url) => {
    shell.openExternal(url)
  })
}
