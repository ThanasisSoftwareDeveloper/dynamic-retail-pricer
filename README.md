# PriceCalc — Υπολογιστής Τιμών Greek e-Shops

Desktop εφαρμογή για αναζήτηση τιμών από ελληνικά e-shops και υπολογισμό
προτεινόμενης τιμής πώλησης βάσει markup.

---

## Απαιτήσεις

- **Node.js** v18 ή νεότερο → https://nodejs.org
- **Windows** 10/11 x64 (ή macOS 12+)
- Σύνδεση στο Internet (για scraping)

---

## Εγκατάσταση & Εκκίνηση (Development)

```bash
# 1. Εγκατάσταση dependencies
npm install

# 2. Εγκατάσταση Playwright browsers (Chromium)
npx playwright install chromium

# 3. Εκκίνηση σε development mode
npm run dev
```

## Build → .exe (Windows Installer)

```bash
# Build React + package Electron
npm run build:win
```

Το `.exe` θα βρίσκεται στο `dist-electron/`.

---

## Αρχιτεκτονική

```
src/
├── main/                    # Electron Main Process (Node.js)
│   ├── index.js             # Entry point
│   ├── ipc-handlers.js      # IPC bridge
│   ├── db/
│   │   ├── database.js      # SQLite (better-sqlite3)
│   │   └── schema.sql       # Tables & default data
│   ├── scraper/
│   │   ├── engine.js        # Orchestrator (Skroutz + 2 shops)
│   │   ├── stealth.js       # Playwright stealth browser
│   │   ├── skroutz.js       # Skroutz scraper (primary)
│   │   └── shops/
│   │       ├── registry.js  # 50+ shops με selectors
│   │       └── shopScraper.js # Generic shop scraper
│   └── pricing/
│       └── calculator.js    # Markup & price logic
└── renderer/                # React UI
    ├── App.jsx
    ├── store/useStore.js    # Zustand state
    └── components/
        ├── SearchBar.jsx
        ├── PriceTable.jsx
        ├── MarkupPanel.jsx
        ├── RecommendedPrice.jsx
        ├── Warnings.jsx
        └── MarkupSettings.jsx
```

---

## Λογική Αναζήτησης

```
1. Cache check (TTL 60 λεπτά) → αν έχουμε πρόσφατα αποτελέσματα, τα επιστρέφουμε
2. Skroutz (παράλληλα με Tier A shops)
   → 1 τιμή: η χαμηλότερη που εμφανίζει
3. Tier A shops (Πλαίσιο, Public, Κωτσόβολος, κλπ)
   → 2 shops αν Skroutz βρέθηκε
   → 3 shops αν Skroutz απέτυχε
4. Fallback σε Tier B → C αν τα Tier A αποτύχουν
5. Σύνολο: πάντα 3 τιμές (ή λιγότερες με warning)
```

---

## Λογική Υπολογισμού Τιμής

### Markup Κλίμακα (default, τροποποιήσιμη)

| Κόστος χωρίς ΦΠΑ | Markup |
|-------------------|--------|
| ≤ €3              | 100%   |
| €3 – €7           | 70%    |
| €7 – €15          | 45%    |
| €15 – €30         | 30%    |
| €30 – €60         | 22%    |
| €60 – €120        | 16%    |
| €120 – €200       | 12%    |
| ≥ €200            | 10%    |

### Προτεινόμενη Τιμή (Σειρά Προτεραιότητας)

1. **Πάνω από Skroutz** (+2%) — αν το αποτέλεσμα ≥ min markup
2. **Κοντά στον μέσο όρο** αγοράς — αν βελτιώνει το 1
3. **Ελάχιστο markup** — fallback

Τελικό rounding: **στο .90** (π.χ. 91.90€)

---

## Anti-Scraping Μέτρα

- **Playwright Stealth**: αποκρύπτει automation flags
- **Realistic User-Agents**: rotation από pool 5 UAs
- **Human-like delays**: 600–1800ms μεταξύ requests
- **Block images/fonts**: ταχύτερο scraping, λιγότερο "ύποπτο"
- **Locale ελλαδική**: el-GR, timezone Athens, geolocation Athens
- **Cache 60 λεπτών**: αποφεύγει επαναλαμβανόμενα requests
- **Αποφυγή πολλαπλών requests στο ίδιο site**: max 1/site/search

---

## Warnings

Η εφαρμογή εμφανίζει warnings για:
- `⚠ Δεν είναι διαθέσιμα μεταφορικά` — shop δεν αναφέρει shipping
- `✓ Συμπεριλαμβάνεται αποστολή` — όταν αναγνωριστεί free shipping
- `ℹ Αποτελέσματα από cache` — τιμές < 60 λεπτά
- `✖ Λίγες τιμές` — αν βρεθούν < 2 αποτελέσματα
