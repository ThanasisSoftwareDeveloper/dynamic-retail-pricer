/**
 * priceUtils.js
 * Shared price parsing and validation utilities.
 * No circular dependencies.
 */

/**
 * Parse Greek-format price string to float.
 * Handles: "1.299,90 €", "€ 1290.90", "1290,90", "1290.90"
 */
function parsePrice (text) {
  if (!text) return null
  const clean = String(text)
    .replace(/\s/g, '')
    .replace('€', '')
    .replace(/\./g, '')   // remove thousands separator (Greek uses dot)
    .replace(',', '.')    // decimal comma → dot
    .trim()
  const n = parseFloat(clean)
  return (isNaN(n) || n <= 0) ? null : n
}

/**
 * Reject numbers that are almost certainly NOT product prices.
 * Real prices in Greek e-shops:
 *  - Almost always have cents (.90, .99, .00) OR are large round numbers
 *  - Are > €2
 *  - Small integers without cents (15, 19) are likely ratings, weights, or %
 */
function isPlausiblePrice (price) {
  if (!price || isNaN(price)) return false
  if (price < 2)     return false   // ratings (4.5★), kg weights
  if (price > 99999) return false   // unrealistic

  // Reject small whole numbers — almost certainly not a price
  // (e.g. 15 = "15 reviews", 19 = "19% off", 5 = "5 stars")
  const isWholeNumber = (price % 1) === 0
  if (isWholeNumber && price < 30) return false

  return true
}

module.exports = { parsePrice, isPlausiblePrice }
