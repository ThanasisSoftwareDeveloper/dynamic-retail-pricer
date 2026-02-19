/**
 * calculator.js
 * Core pricing logic:
 *  - Markup calculation
 *  - Recommended price derivation
 *  - Rounding to .90
 */

const VAT = 0.24

// ─── Markup ───────────────────────────────────────────────────────────────────

/**
 * Returns the applicable markup % for a given cost (excl. VAT).
 * Rules are sorted ascending by min_price.
 */
function getApplicableMarkup (costNoVat, rules) {
  for (const rule of rules) {
    const aboveMin = costNoVat >= rule.min_price
    const belowMax = rule.max_price === null || costNoVat < rule.max_price
    if (aboveMin && belowMax) return rule.markup_pct
  }
  return 10 // hard fallback
}

/**
 * Minimum sale price to cover cost + markup, including VAT.
 * costNoVat * (1 + markup/100) * (1 + VAT)
 */
function minSalePrice (costNoVat, markupPct) {
  return costNoVat * (1 + markupPct / 100) * (1 + VAT)
}

// ─── Rounding ─────────────────────────────────────────────────────────────────

/**
 * Rounds UP to the nearest .90
 * e.g. 91.23 → 91.90 | 91.95 → 92.90 | 91.90 → 91.90
 */
function roundToNinety (value) {
  const whole = Math.floor(value)
  const cents = value - whole

  if (cents <= 0.9 && value <= whole + 0.9) {
    // Check if already exactly .90
    if (Math.abs(cents - 0.9) < 0.001) return parseFloat((whole + 0.9).toFixed(2))
    // Otherwise snap up to .90
    if (cents < 0.9) return parseFloat((whole + 0.9).toFixed(2))
  }
  // cents > .90 → go to next whole + .90
  return parseFloat((whole + 1 + 0.9).toFixed(2))
}

// ─── Recommended Price ────────────────────────────────────────────────────────

/**
 * Derives the recommended sale price using the priority:
 *
 *  PRIORITY 1 – Within markup AND slightly above Skroutz (+skroutzAbovePct %)
 *  PRIORITY 2 – Within markup AND close to market average
 *  PRIORITY 3 – Just the markup minimum (still profitable)
 *
 * Always rounds to .90
 * Always ≥ minSale (never below cost+markup)
 */
function recommendedPrice ({
  costNoVat,
  markupPct,
  skroutzPrice   = null,
  marketPrices   = [],    // array of numbers (all valid prices incl. skroutz)
  skroutzAbovePct = 2     // % above skroutz
}) {
  const minSale = minSalePrice(costNoVat, markupPct)

  const validMarket = marketPrices.filter(p => p && p > 0)
  const avg         = validMarket.length
    ? validMarket.reduce((s, p) => s + p, 0) / validMarket.length
    : null

  let candidate = minSale
  let strategy  = 'markup_minimum'

  // ── Priority 1: slightly above Skroutz ──────────────────────────────────
  if (skroutzPrice && skroutzPrice > 0) {
    const aboveSkroutz = skroutzPrice * (1 + skroutzAbovePct / 100)
    if (aboveSkroutz >= minSale) {
      candidate = aboveSkroutz
      strategy  = 'above_skroutz'
    }
  }

  // ── Priority 2: close to average (if better than current candidate) ──────
  if (avg && avg >= minSale && avg > candidate) {
    // Use midpoint between candidate and avg so we don't overshoot
    const mid = (candidate + avg) / 2
    if (mid >= minSale) {
      candidate = mid
      strategy  = 'near_average'
    }
  }

  // Ensure we never go below minimum
  if (candidate < minSale) {
    candidate = minSale
    strategy  = 'markup_minimum'
  }

  const final = roundToNinety(candidate)

  return {
    recommendedPrice:  final,
    strategy,                  // what drove the price
    minSalePrice:      parseFloat(roundToNinety(minSale).toFixed(2)),
    costNoVat,
    markupPct,
    vatAmount:         parseFloat((final - final / (1 + VAT)).toFixed(2)),
    priceExVat:        parseFloat((final / (1 + VAT)).toFixed(2)),
    profitAmount:      parseFloat((final / (1 + VAT) - costNoVat).toFixed(2)),
    profitPercent:     parseFloat(((final / (1 + VAT) - costNoVat) / costNoVat * 100).toFixed(1)),
    skroutzPrice,
    avgMarketPrice:    avg ? parseFloat(avg.toFixed(2)) : null
  }
}

// ─── Market Stats ─────────────────────────────────────────────────────────────

function marketStats (prices) {
  const valid = prices.filter(p => p && p > 0)
  if (!valid.length) return { min: null, max: null, avg: null, count: 0 }
  return {
    min:   Math.min(...valid),
    max:   Math.max(...valid),
    avg:   parseFloat((valid.reduce((s, p) => s + p, 0) / valid.length).toFixed(2)),
    count: valid.length
  }
}

module.exports = {
  getApplicableMarkup,
  minSalePrice,
  roundToNinety,
  recommendedPrice,
  marketStats,
  VAT
}
