import React, { useEffect } from 'react'
import useStore        from './store/useStore'
import SearchBar       from './components/SearchBar'
import PriceTable      from './components/PriceTable'
import MarkupPanel     from './components/MarkupPanel'
import RecommendedPrice from './components/RecommendedPrice'
import Warnings        from './components/Warnings'
import MarkupSettings  from './components/MarkupSettings'

function TabBtn ({ label, tab, active, onClick }) {
  return (
    <button
      onClick={() => onClick(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active === tab
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  )
}

export default function App () {
  const activeTab    = useStore(s => s.activeTab)
  const setActiveTab = useStore(s => s.setActiveTab)
  const loadRules    = useStore(s => s.loadMarkupRules)
  const result       = useStore(s => s.result)
  const error        = useStore(s => s.error)
  const isSearching  = useStore(s => s.isSearching)
  const progress     = useStore(s => s.progress)

  useEffect(() => {
    loadRules()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏷️</span>
          <h1 className="font-bold text-slate-100">PriceCalc</h1>
          <span className="text-slate-600 text-xs">v1.0</span>
        </div>
        <nav className="flex gap-1">
          <TabBtn label="🔍 Αναζήτηση" tab="search"   active={activeTab} onClick={setActiveTab} />
          <TabBtn label="⚙ Markup"     tab="settings" active={activeTab} onClick={setActiveTab} />
        </nav>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 overflow-y-auto">

        {/* ── SEARCH TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'search' && (
          <div className="max-w-5xl mx-auto space-y-4">

            <SearchBar />

            {/* Progress */}
            {isSearching && progress && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-900/20 border border-blue-800/40">
                <span className="animate-spin text-lg">⏳</span>
                <span className="text-blue-300 text-sm">{progress}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-300 text-sm">
                ✖ {error}
              </div>
            )}

            {/* Results */}
            {result && !isSearching && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left: prices + warnings */}
                <div className="lg:col-span-2 space-y-4">
                  <PriceTable
                    scrapeResult={result.scrapeResult}
                    stats={result.stats}
                  />
                  <Warnings warnings={result.scrapeResult?.warnings} />
                </div>

                {/* Right: markup + recommended */}
                <div className="space-y-4">
                  <MarkupPanel
                    rules={result.rules}
                    activeMarkupPct={result.markupPct}
                    costNoVat={result.costNoVat}
                  />
                  <RecommendedPrice
                    priceCalc={result.priceCalc}
                    productName={result.productName}
                  />
                </div>

              </div>
            )}

          </div>
        )}

        {/* ── SETTINGS TAB ────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-lg mx-auto">
            <MarkupSettings />
          </div>
        )}

      </main>

      {/* ── Status bar ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 px-6 py-1.5 flex items-center gap-4 text-xs text-slate-600">
        <span>PriceCalc © 2024</span>
        {result?.scrapeResult?.fromCache && (
          <span className="text-amber-600">● Αποτελέσματα από cache (≤60 λεπτά)</span>
        )}
      </footer>

    </div>
  )
}
