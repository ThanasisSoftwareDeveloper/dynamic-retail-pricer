import React, { useRef } from 'react'
import useStore from '../store/useStore'

export default function SearchBar () {
  const query      = useStore(s => s.query)
  const costNoVat  = useStore(s => s.costNoVat)
  const isSearching = useStore(s => s.isSearching)
  const setQuery    = useStore(s => s.setQuery)
  const setCost     = useStore(s => s.setCostNoVat)
  const doSearch    = useStore(s => s.doSearch)

  const costRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.target === document.querySelector('#query-input')) {
        costRef.current?.focus()
      } else {
        doSearch()
      }
    }
  }

  const valid = query.trim() && costNoVat && parseFloat(costNoVat) > 0

  return (
    <div className="card space-y-4">
      <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest">
        Αναζήτηση Προϊόντος
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Query */}
        <div>
          <label className="label">Barcode ή Όνομα Προϊόντος</label>
          <input
            id="query-input"
            className="input font-mono"
            placeholder="π.χ. 5901234123457 ή iPhone 15 Pro"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
            autoFocus
          />
        </div>

        {/* Cost */}
        <div>
          <label className="label">Τιμή Αγοράς χωρίς ΦΠΑ (€)</label>
          <div className="relative">
            <input
              ref={costRef}
              className="input pr-8"
              placeholder="π.χ. 45.50"
              type="number"
              min="0"
              step="0.01"
              value={costNoVat}
              onChange={e => setCost(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">€</span>
          </div>
        </div>
      </div>

      <button
        className="btn-primary w-full sm:w-auto"
        onClick={doSearch}
        disabled={!valid || isSearching}
      >
        {isSearching ? '⏳ Αναζήτηση...' : '🔍 Υπολογισμός Τιμής'}
      </button>
    </div>
  )
}
