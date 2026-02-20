# PriceCalc — Greek e-Shop Price Comparison & Markup Calculator

A desktop application that searches prices from Greek e-shops and calculates
a recommended selling price based on configurable markup rules.

---

## Requirements

- **Node.js** v18 or later → https://nodejs.org
- **Windows** 10/11 x64 (or macOS 12+)
- Active internet connection (required for scraping)

---

## Installation & Setup

### Option A — Run setup.bat (Windows)
1. Extract the ZIP file
2. Open the `electron-pricer` folder
3. Open a Command Prompt inside that folder (Shift + Right-click → "Open command window here")
4. Run:

```
setup.bat
```

### Option B — Manual setup
```bash
# 1. Install dependencies
npm install

# 2. Install Playwright Chromium browser (~150MB)
npx playwright install chromium

# 3. Start in development mode
npm run dev
```

---

## Build Windows Installer (.exe)

```bash
npm run build:win
```

The installer will be created in the `dist-electron/` folder.
<img width="1067" height="1025" alt="image" src="https://github.com/user-attachments/assets/1589d451-016e-4477-a135-54aaf0df702c" />

---

## How It Works

### Search Pipeline

```
1. Cache check (TTL: 60 minutes)
   → If we have recent results for this query, return them immediately

2. Skroutz (runs in parallel with Tier A shops)
   → 1 price only: the lowest price shown on the product page

3. Tier A shops (Plaisio, Public, Kotsovolos, e-shop, Germanos...)
   → 2 shops if Skroutz found the product
   → 3 shops if Skroutz did not find the product

4. Fallback: Tier B → Tier C shops if Tier A shops fail

5. Total: always 3 prices for the average (fewer = warning shown)
```

### Recommended Price Logic (Priority Order)

1. **Just above Skroutz** (+2%) — if result is above minimum markup
2. **Close to market average** — if it improves on option 1
3. **Markup minimum** — fallback, always profitable

Final rounding: **to .90** (e.g. €91.90)

---

## Markup Scale (default, fully editable in Settings tab)

| Purchase cost (excl. VAT) | Markup |
|---------------------------|--------|
| up to €3                  | 100%   |
| €3 – €7                   | 70%    |
| €7 – €15                  | 45%    |
| €15 – €30                 | 30%    |
| €30 – €60                 | 22%    |
| €60 – €120                | 16%    |
| €120 – €200               | 12%    |
| €200 and above            | 10%    |

VAT rate applied: **24%**

---

## Project Structure

```
src/
├── main/                        # Electron Main Process (Node.js)
│   ├── index.js                 # App entry point
│   ├── ipc-handlers.js          # IPC bridge (main <-> renderer)
│   ├── db/
│   │   ├── database.js          # SQLite via sql.js (no compilation needed)
│   │   └── schema.sql           # Tables & default markup data
│   ├── scraper/
│   │   ├── engine.js            # Search orchestrator
│   │   ├── stealth.js           # Playwright stealth browser setup
│   │   ├── skroutz.js           # Skroutz scraper (primary source)
│   │   ├── priceUtils.js        # Shared price parsing & validation
│   │   └── shops/
│   │       ├── registry.js      # 50+ shops with CSS selectors & tiers
│   │       └── shopScraper.js   # Generic scraper for any registered shop
│   └── pricing/
│       └── calculator.js        # Markup & recommended price logic
└── renderer/                    # React UI (Vite + Tailwind)
    ├── App.jsx                  # Main layout & tab navigation
    ├── store/useStore.js        # Zustand global state
    └── components/
        ├── SearchBar.jsx        # Query + purchase price input
        ├── PriceTable.jsx       # Scraped prices table
        ├── MarkupPanel.jsx      # Active markup tier display
        ├── RecommendedPrice.jsx # Hero price + profit breakdown
        ├── Warnings.jsx         # Shipping & scraping warnings
        └── MarkupSettings.jsx   # Editable markup rules
```

---

## Anti-Scraping Measures

- **Playwright Stealth plugin** — hides all browser automation flags
- **User-Agent rotation** — pool of 5 realistic Chrome/Firefox UAs
- **Human-like delays** — 600–1800ms random delay between requests
- **Block images/fonts/media** — faster page load, less detectable
- **Greek locale** — el-GR language, Athens timezone & geolocation
- **60-minute cache** — avoids repeat requests for the same product
- **Max 1 request per site per search** — respectful scraping

## Price Validation

The scraper rejects values that are clearly not product prices:
- Values below €2 (star ratings, weights, dimensions)
- Whole numbers below €30 without decimals (review counts, percentages)
- Pages returning HTTP 404 or "no results" responses

---

## Warnings Displayed

| Icon | Meaning |
|------|---------|
| ⚠ | Shop did not include shipping cost information |
| ✓ | Free shipping detected for this shop |
| i | Prices loaded from cache (less than 60 minutes old) |
| ✖ | Too few prices found — try a different search query |

---

## Supported Shops (50+)

**Tier A** (searched first): Plaisio, Public, Kotsovolos, e-shop.gr, You.gr, Germanos

**Tier B** (fallback): Electronet, Shopflix, iStorm, iSquare, PC1, MrBig,
Gadget Market, HellasDigital, Techstores, TowerShop, IT Store, Cosmodata,
Msystems, VisionStudio, Websupplies, Cosmote eShop, Vodafone eShop, Nova

**Tier C** (last resort): FixShop, data-media, batteries.gr, dot-media,
MGManager, Toner Hellas, printking, G for Gadget, Oktabit, ACI Hellas,
papaxaralabous, dexter, Gadgetistas, easytechnology, BatteryPro, gerasis.net,
Thikishop, ITsys, Tonerworld, e-Gate, techbox, Teleparts, papirosbook
