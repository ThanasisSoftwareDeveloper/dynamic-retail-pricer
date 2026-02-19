-- PriceCalc Schema v1.0

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── Markup Rules ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS markup_rules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  min_price   REAL    NOT NULL,
  max_price   REAL,               -- NULL = ∞
  markup_pct  REAL    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO markup_rules (id, min_price, max_price, markup_pct, sort_order) VALUES
  (1,   0,    3,    100, 1),
  (2,   3,    7,    70,  2),
  (3,   7,    15,   45,  3),
  (4,   15,   30,   30,  4),
  (5,   30,   60,   22,  5),
  (6,   60,   120,  16,  6),
  (7,   120,  200,  12,  7),
  (8,   200,  NULL, 10,  8);

-- ── Price Cache ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_cache (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  search_query      TEXT    NOT NULL,
  shop_name         TEXT    NOT NULL,
  shop_url          TEXT,
  price             REAL,
  includes_shipping INTEGER DEFAULT 0,
  shipping_note     TEXT,
  scraped_at        INTEGER NOT NULL,
  UNIQUE(search_query, shop_name)
);

CREATE INDEX IF NOT EXISTS idx_cache_query
  ON price_cache(search_query, scraped_at);

-- ── Search History ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  search_query        TEXT    NOT NULL,
  product_name        TEXT,
  cost_no_vat         REAL    NOT NULL,
  markup_pct          REAL    NOT NULL,
  recommended_price   REAL    NOT NULL,
  min_market_price    REAL,
  max_market_price    REAL,
  avg_market_price    REAL,
  skroutz_price       REAL,
  prices_json         TEXT,
  searched_at         INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_date
  ON search_history(searched_at DESC);

-- ── App Settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO app_settings (key, value) VALUES
  ('vat_rate',           '0.24'),
  ('cache_ttl_minutes',  '60'),
  ('skroutz_above_pct',  '2'),
  ('scrape_timeout_ms',  '20000'),
  ('use_cache',          '1');
