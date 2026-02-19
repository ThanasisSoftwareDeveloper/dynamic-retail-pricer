import React from 'react'

export default function PriceTable ({ scrapeResult, stats }) {
  if (!scrapeResult?.allResults?.length) return null

  const { allResults, fromCache } = scrapeResult

  const minPrice = stats?.min
  const maxPrice = stats?.max

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest">
          Τιμές Αγοράς
        </h2>
        {fromCache && (
          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
            📦 από cache
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
              <th className="text-left pb-2 pr-4">Κατάστημα</th>
              <th className="text-right pb-2 pr-4">Τιμή</th>
              <th className="text-left pb-2">Αποστολή</th>
            </tr>
          </thead>
          <tbody>
            {allResults
              .filter(r => r.price)
              .sort((a, b) => a.price - b.price)
              .map((r, i) => {
                const isMin = r.price === minPrice
                const isMax = r.price === maxPrice
                const isSkroutz = r.shop_name === 'Skroutz'

                return (
                  <tr
                    key={i}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        {isSkroutz && <span className="text-orange-400">★</span>}
                        <button
                          className="text-slate-200 hover:text-blue-400 transition-colors text-left"
                          onClick={() => r.shop_url && window.api.openExternal(r.shop_url)}
                          title={r.shop_url || ''}
                        >
                          {r.shop_name}
                        </button>
                        {isMin && (
                          <span className="text-xs bg-emerald-900/60 text-emerald-400 px-1.5 py-0.5 rounded">
                            ↓ min
                          </span>
                        )}
                        {isMax && !isMin && (
                          <span className="text-xs bg-red-900/60 text-red-400 px-1.5 py-0.5 rounded">
                            ↑ max
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono font-semibold text-slate-100">
                      €{r.price.toFixed(2)}
                    </td>
                    <td className="py-2">
                      {r.includes_shipping
                        ? <span className="text-emerald-400 text-xs">✓ συμπεριλαμβάνεται</span>
                        : <span className="text-amber-500 text-xs">⚠ δεν αναφέρεται</span>}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      <div className="flex gap-6 pt-1 text-xs text-slate-500 border-t border-slate-700">
        <span>Min: <strong className="text-emerald-400">€{stats?.min?.toFixed(2) ?? '—'}</strong></span>
        <span>Max: <strong className="text-red-400">€{stats?.max?.toFixed(2) ?? '—'}</strong></span>
        <span>Μέσος: <strong className="text-slate-300">€{stats?.avg?.toFixed(2) ?? '—'}</strong></span>
        <span>Δείγματα: <strong className="text-slate-300">{stats?.count ?? 0}</strong></span>
      </div>
    </div>
  )
}
