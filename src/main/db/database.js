/**
 * database.js
 * Uses sql.js - pure JavaScript SQLite, no native compilation needed.
 * Works with any Node.js version including v24.
 * Data is persisted to disk manually (load on start, save on write).
 */

const path = require('path')
const fs   = require('fs')

let SQL = null   // sql.js module
let db  = null   // database instance
let dbPath = null

// ─── Path ─────────────────────────────────────────────────────────────────────

function getDbPath () {
  try {
    const { app } = require('electron')
    return path.join(app.getPath('userData'), 'pricecalc.db')
  } catch {
    return path.join(__dirname, '../../../pricecalc.db')
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function initDatabase () {
  if (db) return db

  // sql.js needs to be loaded async
  const initSqlJs = require('sql.js')
  SQL = await initSqlJs()

  dbPath = getDbPath()
  console.log('[DB] Path:', dbPath)

  // Load existing DB from disk or create new
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
    console.log('[DB] Loaded from disk.')
  } else {
    db = new SQL.Database()
    console.log('[DB] Created new database.')
  }

  // Apply schema
  const schemaPath = path.join(__dirname, 'schema.sql')
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8')
    db.run(schema)
  } else {
    runInlineSchema()
  }

  persist()
  console.log('[DB] Ready.')
  return db
}

/** Save DB to disk after every write */
function persist () {
  if (!db || !dbPath) return
  try {
    const data = db.export()
    const buf  = Buffer.from(data)
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    fs.writeFileSync(dbPath, buf)
  } catch (e) {
    console.error('[DB] persist error:', e.message)
  }
}

function runInlineSchema () {
  db.run(`
    CREATE TABLE IF NOT EXISTS markup_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      min_price REAL NOT NULL,
      max_price REAL,
      markup_pct REAL NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    INSERT OR IGNORE INTO markup_rules (id,min_price,max_price,markup_pct,sort_order) VALUES
      (1,0,3,100,1),(2,3,7,70,2),(3,7,15,45,3),(4,15,30,30,4),
      (5,30,60,22,5),(6,60,120,16,6),(7,120,200,12,7),(8,200,NULL,10,8);

    CREATE TABLE IF NOT EXISTS price_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_query TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      shop_url TEXT,
      price REAL,
      includes_shipping INTEGER DEFAULT 0,
      shipping_note TEXT,
      scraped_at INTEGER NOT NULL,
      UNIQUE(search_query, shop_name)
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_query TEXT NOT NULL,
      product_name TEXT,
      cost_no_vat REAL NOT NULL,
      markup_pct REAL NOT NULL,
      recommended_price REAL NOT NULL,
      min_market_price REAL,
      max_market_price REAL,
      avg_market_price REAL,
      skroutz_price REAL,
      prices_json TEXT,
      searched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    INSERT OR IGNORE INTO app_settings (key,value) VALUES
      ('vat_rate','0.24'),
      ('cache_ttl_minutes','60'),
      ('skroutz_above_pct','2'),
      ('scrape_timeout_ms','20000'),
      ('use_cache','1');
  `)
}

// ─── Helper: run query and get all rows as objects ────────────────────────────

function query (sql, params = []) {
  const stmt    = db.prepare(sql)
  const results = []
  stmt.bind(params)
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

function run (sql, params = []) {
  db.run(sql, params)
  persist()
}

// ─── Markup Rules ─────────────────────────────────────────────────────────────

function getMarkupRules () {
  return query('SELECT * FROM markup_rules ORDER BY sort_order')
}

function saveMarkupRules (rules) {
  db.run('DELETE FROM markup_rules')
  rules.forEach((r, i) => {
    db.run(
      'INSERT INTO markup_rules (min_price,max_price,markup_pct,sort_order) VALUES (?,?,?,?)',
      [r.min_price, r.max_price ?? null, r.markup_pct, i + 1]
    )
  })
  persist()
}

function getMarkupForPrice (costNoVat) {
  const rules = getMarkupRules()
  for (const rule of rules) {
    const aboveMin = costNoVat >= rule.min_price
    const belowMax = rule.max_price === null || costNoVat < rule.max_price
    if (aboveMin && belowMax) return rule.markup_pct
  }
  return 10
}

// ─── Cache ────────────────────────────────────────────────────────────────────

function getCached (q, ttlMinutes = 60) {
  const cutoff = Math.floor(Date.now() / 1000) - ttlMinutes * 60
  return query(
    'SELECT * FROM price_cache WHERE search_query=? AND scraped_at>?',
    [q.toLowerCase().trim(), cutoff]
  )
}

function saveCache (q, results) {
  const now = Math.floor(Date.now() / 1000)
  results.forEach(r => {
    db.run(
      `INSERT OR REPLACE INTO price_cache
        (search_query,shop_name,shop_url,price,includes_shipping,shipping_note,scraped_at)
       VALUES (?,?,?,?,?,?,?)`,
      [q.toLowerCase().trim(), r.shop_name, r.shop_url || null,
       r.price || null, r.includes_shipping ? 1 : 0,
       r.shipping_note || null, now]
    )
  })
  persist()
}

// ─── History ──────────────────────────────────────────────────────────────────

function saveHistory (entry) {
  db.run(
    `INSERT INTO search_history
      (search_query,product_name,cost_no_vat,markup_pct,recommended_price,
       min_market_price,max_market_price,avg_market_price,skroutz_price,
       prices_json,searched_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      entry.search_query, entry.product_name || null,
      entry.cost_no_vat, entry.markup_pct, entry.recommended_price,
      entry.min_market_price || null, entry.max_market_price || null,
      entry.avg_market_price || null, entry.skroutz_price || null,
      JSON.stringify(entry.prices || []),
      Math.floor(Date.now() / 1000)
    ]
  )
  persist()
}

function getHistory (limit = 50) {
  return query(
    'SELECT * FROM search_history ORDER BY searched_at DESC LIMIT ?',
    [limit]
  ).map(r => ({ ...r, prices: JSON.parse(r.prices_json || '[]') }))
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function getSetting (key) {
  const rows = query('SELECT value FROM app_settings WHERE key=?', [key])
  return rows.length ? rows[0].value : null
}

function setSetting (key, value) {
  db.run('INSERT OR REPLACE INTO app_settings (key,value) VALUES (?,?)', [key, String(value)])
  persist()
}

function getAllSettings () {
  const rows = query('SELECT key,value FROM app_settings')
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

module.exports = {
  initDatabase,
  getMarkupRules,
  saveMarkupRules,
  getMarkupForPrice,
  getCached,
  saveCache,
  saveHistory,
  getHistory,
  getSetting,
  setSetting,
  getAllSettings
}
