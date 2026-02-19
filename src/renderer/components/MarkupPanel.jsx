import React from 'react'

export default function MarkupPanel ({ rules, activeMarkupPct, costNoVat }) {
  if (!rules?.length) return null

  return (
    <div className="card space-y-3">
      <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest">
        Markup Κλίμακα
      </h2>

      <div className="space-y-1">
        {rules.map((rule, i) => {
          const isActive = rule.markup_pct === activeMarkupPct &&
            costNoVat >= rule.min_price &&
            (rule.max_price === null || costNoVat < rule.max_price)

          const maxLabel = rule.max_price === null ? '∞' : `€${rule.max_price}`

          return (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/30 border border-blue-500/50 text-blue-200'
                  : 'text-slate-400 hover:bg-slate-700/30'
              }`}
            >
              <span className="font-mono text-xs">
                €{rule.min_price} – {maxLabel}
              </span>
              <span className={`font-bold ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>
                {rule.markup_pct}%
                {isActive && <span className="ml-2 text-xs font-normal text-blue-400">← εφαρμόζεται</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
