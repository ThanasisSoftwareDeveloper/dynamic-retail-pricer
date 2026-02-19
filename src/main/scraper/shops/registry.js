/**
 * shops.js
 * Registry of all supported shops with:
 *  - Search URL template
 *  - CSS selectors for price extraction
 *  - Shipping selectors
 *  - Tier (A = big/reliable, B = medium, C = small/niche)
 *  - Fallback priority order within tier
 *
 * Deduplication applied (oktabit, cosmodata, tonerhellas kept once each).
 */

const SHOPS = [
  // ══════════════════════════════════════════════
  // TIER A — Μεγάλα καταστήματα
  // ══════════════════════════════════════════════
  {
    name:        'Πλαίσιο',
    tier:        'A',
    base:        'https://www.plaisio.gr',
    searchUrl:   q => `https://www.plaisio.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: [
      '.product-price__current',
      '.price-current',
      '[class*="current-price"]',
      'span.price'
    ],
    shippingSelectors: ['.shipping-cost', '[class*="shipping"]'],
    firstResultSel: 'a.product-card__link, .product-name a, a[href*="/product/"]'
  },
  {
    name:        'Public',
    tier:        'A',
    base:        'https://www.public.gr',
    searchUrl:   q => `https://www.public.gr/search/${encodeURIComponent(q)}`,
    priceSelectors: [
      '[class*="price-sales"]',
      '.price__current',
      '[itemprop="price"]',
      'span.price'
    ],
    shippingSelectors: ['[class*="shipping"]', '.delivery-info'],
    firstResultSel: 'a[class*="product-link"], .product-title a'
  },
  {
    name:        'Κωτσόβολος',
    tier:        'A',
    base:        'https://www.kotsovolos.gr',
    searchUrl:   q => `https://www.kotsovolos.gr/search?text=${encodeURIComponent(q)}`,
    priceSelectors: [
      '.price-box .regular-price .price',
      '.product-main-price',
      '[class*="current-price"]',
      'span.price'
    ],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: '.product-item a, a.product-name'
  },
  {
    name:        'e-shop.gr',
    tier:        'A',
    base:        'https://www.e-shop.gr',
    searchUrl:   q => `https://www.e-shop.gr/search.phtml?search=${encodeURIComponent(q)}`,
    priceSelectors: [
      '.price-new',
      '.product-price',
      '[class*="price"]',
      'span[itemprop="price"]'
    ],
    shippingSelectors: ['.shipping', '[class*="transport"]'],
    firstResultSel: '.product-box a, a.product-link'
  },
  {
    name:        'You.gr',
    tier:        'A',
    base:        'https://www.you.gr',
    searchUrl:   q => `https://www.you.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: [
      '.current-price',
      '[class*="price-sale"]',
      'span.price'
    ],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-name, .product-link'
  },
  {
    name:        'ΓΕΡΜΑΝΟΣ',
    tier:        'A',
    base:        'https://www.germanos.gr',
    searchUrl:   q => `https://www.germanos.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: [
      '.product-price .current',
      '[class*="price"]',
      'span.price'
    ],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-title, .product-name a'
  },

  // ══════════════════════════════════════════════
  // TIER B — Μεσαία καταστήματα
  // ══════════════════════════════════════════════
  {
    name:        'Electronet',
    tier:        'B',
    base:        'https://www.electronet.gr',
    searchUrl:   q => `https://www.electronet.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.product-price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'SHOPFLIX',
    tier:        'B',
    base:        'https://shopflix.gr',
    searchUrl:   q => `https://shopflix.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['.price-box .price', 'span.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-item-link, .product-link'
  },
  {
    name:        'iStorm',
    tier:        'B',
    base:        'https://www.istorm.gr',
    searchUrl:   q => `https://www.istorm.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['.price', '[class*="price"]', 'span[itemprop="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'iSquare Store',
    tier:        'B',
    base:        'https://www.isquare.gr',
    searchUrl:   q => `https://www.isquare.gr/store/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['.price', 'span.amount', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.woocommerce-LoopProduct-link, .product-link'
  },
  {
    name:        'PC1',
    tier:        'B',
    base:        'https://www.pc1.gr',
    searchUrl:   q => `https://www.pc1.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.product-price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: '.product-link a, a[href*="/product"]'
  },
  {
    name:        'MrBig',
    tier:        'B',
    base:        'https://mrbig.gr',
    searchUrl:   q => `https://mrbig.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Gadget Market',
    tier:        'B',
    base:        'https://www.gadget-market.gr',
    searchUrl:   q => `https://www.gadget-market.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .woocommerce-loop-product__link'
  },
  {
    name:        'HellasDigital',
    tier:        'B',
    base:        'https://www.hellasdigital.gr',
    searchUrl:   q => `https://www.hellasdigital.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Techstores',
    tier:        'B',
    base:        'https://www.techstores.gr',
    searchUrl:   q => `https://www.techstores.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'TowerShop',
    tier:        'B',
    base:        'https://www.towershop.gr',
    searchUrl:   q => `https://www.towershop.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'IT Store',
    tier:        'B',
    base:        'https://www.it-store.gr',
    searchUrl:   q => `https://www.it-store.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Cosmodata',
    tier:        'B',
    base:        'https://www.cosmodata.gr',
    searchUrl:   q => `https://www.cosmodata.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Msystems',
    tier:        'B',
    base:        'https://www.msystems.gr',
    searchUrl:   q => `https://www.msystems.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'VisionStudio',
    tier:        'B',
    base:        'https://www.visionstudio.gr',
    searchUrl:   q => `https://www.visionstudio.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Websupplies',
    tier:        'B',
    base:        'https://www.websupplies.gr',
    searchUrl:   q => `https://www.websupplies.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },

  // ══════════════════════════════════════════════
  // TIER B — Telecom / Apple
  // ══════════════════════════════════════════════
  {
    name:        'COSMOTE eShop',
    tier:        'B',
    base:        'https://www.cosmote.gr',
    searchUrl:   q => `https://www.cosmote.gr/eshop/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Vodafone eShop',
    tier:        'B',
    base:        'https://www.vodafone.gr',
    searchUrl:   q => `https://www.vodafone.gr/eshop/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Nova',
    tier:        'B',
    base:        'https://nova.gr',
    searchUrl:   q => `https://nova.gr/syskeues/?s=${encodeURIComponent(q)}`,
    priceSelectors: ['.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .woocommerce-loop-product__link'
  },

  // ══════════════════════════════════════════════
  // TIER C — Niche / Specialty
  // ══════════════════════════════════════════════
  {
    name:        'FixShop',
    tier:        'C',
    base:        'https://fix-shop.gr',
    searchUrl:   q => `https://fix-shop.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'data-media',
    tier:        'C',
    base:        'https://www.data-media.gr',
    searchUrl:   q => `https://www.data-media.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'batteries.gr',
    tier:        'C',
    base:        'https://www.batteries.gr',
    searchUrl:   q => `https://www.batteries.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'dot-media',
    tier:        'C',
    base:        'https://www.dot-media.gr',
    searchUrl:   q => `https://www.dot-media.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'MGManager',
    tier:        'C',
    base:        'https://www.mgmanager.gr',
    searchUrl:   q => `https://www.mgmanager.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Toner Hellas',
    tier:        'C',
    base:        'https://www.tonerhellas.com',
    searchUrl:   q => `https://www.tonerhellas.com/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'printking',
    tier:        'C',
    base:        'https://www.printking.gr',
    searchUrl:   q => `https://www.printking.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'G for Gadget',
    tier:        'C',
    base:        'https://gforgadget.gr',
    searchUrl:   q => `https://gforgadget.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .woocommerce-loop-product__link'
  },
  {
    name:        'Oktabit',
    tier:        'C',
    base:        'https://www.oktabit.gr',
    searchUrl:   q => `https://www.oktabit.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'ACI Hellas',
    tier:        'C',
    base:        'https://www.acihellas.gr',
    searchUrl:   q => `https://www.acihellas.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'papaxaralabous',
    tier:        'C',
    base:        'https://papaxaralabous.gr',
    searchUrl:   q => `https://papaxaralabous.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'dexter',
    tier:        'C',
    base:        'https://www.dexter.com.gr',
    searchUrl:   q => `https://www.dexter.com.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Gadgetistas',
    tier:        'C',
    base:        'https://gadgetistas.com',
    searchUrl:   q => `https://gadgetistas.com/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .woocommerce-loop-product__link'
  },
  {
    name:        'easytechnology',
    tier:        'C',
    base:        'https://www.easytechnology.gr',
    searchUrl:   q => `https://www.easytechnology.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'BatteryPro',
    tier:        'C',
    base:        'https://www.batterypro.gr',
    searchUrl:   q => `https://www.batterypro.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'gerasis.net',
    tier:        'C',
    base:        'https://www.gerasis.net',
    searchUrl:   q => `https://www.gerasis.net/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Thikishop',
    tier:        'C',
    base:        'https://thikishop.gr',
    searchUrl:   q => `https://thikishop.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .woocommerce-loop-product__link'
  },
  {
    name:        'ITsys',
    tier:        'C',
    base:        'https://www.itsys.gr',
    searchUrl:   q => `https://www.itsys.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Tonerworld',
    tier:        'C',
    base:        'https://www.tonerworld.gr',
    searchUrl:   q => `https://www.tonerworld.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'e-Gate',
    tier:        'C',
    base:        'https://www.e-gate.gr',
    searchUrl:   q => `https://www.e-gate.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'techbox',
    tier:        'C',
    base:        'https://techbox.com.gr',
    searchUrl:   q => `https://techbox.com.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'Teleparts',
    tier:        'C',
    base:        'https://teleparts.gr',
    searchUrl:   q => `https://teleparts.gr/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  },
  {
    name:        'papirosbook',
    tier:        'C',
    base:        'https://papirosbookstores.com',
    searchUrl:   q => `https://papirosbookstores.com/search?q=${encodeURIComponent(q)}`,
    priceSelectors: ['span.price', '.price', '[class*="price"]'],
    shippingSelectors: ['[class*="shipping"]'],
    firstResultSel: 'a.product-link, .product-name a'
  }
]

// Tier order for fallback selection
const TIER_ORDER = ['A', 'B', 'C']

/**
 * Returns shops in fallback priority order, excluding Skroutz.
 * Always starts with Tier A, then B, then C.
 */
function getShopsByPriority () {
  return TIER_ORDER.flatMap(tier => SHOPS.filter(s => s.tier === tier))
}

module.exports = { SHOPS, getShopsByPriority }
