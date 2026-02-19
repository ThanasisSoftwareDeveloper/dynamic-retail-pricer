/**
 * stealth.js
 * Launches a Playwright browser with anti-detection measures:
 *  - Stealth plugin (hides automation flags)
 *  - Realistic User-Agent rotation
 *  - Human-like delays
 *  - Shared browser instance (reused across scrapes)
 */

const { chromium } = require('playwright-extra')
const stealth      = require('puppeteer-extra-plugin-stealth')

chromium.use(stealth())

// ─── User-Agent Pool ──────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
]

let browserInstance = null

function randomUA () {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

/** Human-like random delay between min and max ms */
function humanDelay (min = 600, max = 1800) {
  const ms = min + Math.floor(Math.random() * (max - min))
  return new Promise(r => setTimeout(r, ms))
}

async function getBrowser () {
  if (browserInstance && browserInstance.isConnected()) return browserInstance

  browserInstance = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1366,768',
      '--disable-blink-features=AutomationControlled'
    ]
  })

  browserInstance.on('disconnected', () => { browserInstance = null })
  return browserInstance
}

async function newStealthPage (timeoutMs = 20000) {
  const browser = await getBrowser()
  const ctx     = await browser.newContext({
    userAgent:        randomUA(),
    viewport:         { width: 1366, height: 768 },
    locale:           'el-GR',
    timezoneId:       'Europe/Athens',
    geolocation:      { latitude: 37.9838, longitude: 23.7275 },
    permissions:      ['geolocation'],
    extraHTTPHeaders: {
      'Accept-Language': 'el-GR,el;q=0.9,en;q=0.8',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'DNT':             '1'
    }
  })

  const page = await ctx.newPage()
  page.setDefaultTimeout(timeoutMs)
  page.setDefaultNavigationTimeout(timeoutMs)

  // Block images/fonts/media to speed up scraping
  await page.route('**/*', (route) => {
    const type = route.request().resourceType()
    if (['image', 'font', 'media', 'stylesheet'].includes(type)) {
      route.abort()
    } else {
      route.continue()
    }
  })

  return { page, ctx }
}

async function closeBrowser () {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}

module.exports = { newStealthPage, humanDelay, closeBrowser, randomUA }
