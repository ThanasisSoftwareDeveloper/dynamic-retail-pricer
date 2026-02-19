import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'

export default function MarkupSettings () {
  const storeRules    = useStore(s => s.markupRules)
  const loadRules     = useStore(s => s.loadMarkupRules)
  const saveRules     = useStore(s => s.saveMarkupRules)

  const [rules, setRules]   = useState([])
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    loadRules()
  }, [])

  useEffect(() => {
    setRules(storeRules.map(r => ({ ...r })))
  }, [storeRules])

  const updateRule = (id, field, value) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: value === '' ? null : parseFloat(value) } : r
    ))
  }

  const handleSave = async () => {
    try {
      setError(null)
      // Validate: markup_pct must be > 0 for all
      if (rules.some(r => !r.markup_pct || r.markup_pct <= 0)) {
        setError('Όλα τα ποσοστά markup πρέπει να είναι > 0.')
        return
      }
      await saveRules(rules)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e.message)
    }
  }

  const reset = async () => {
    const defaults = [
      { id: 1, min_price: 0,   max_price: 3,   markup_pct: 100, sort_order: 1 },
      { id: 2, min_price: 3,   max_price: 7,   markup_pct: 70,  sort_order: 2 },
      { id: 3, min_price: 7,   max_price: 15,  markup_pct: 45,  sort_order: 3 },
      { id: 4, min_price: 15,  max_price: 30,  markup_pct: 30,  sort_order: 4 },
      { id: 5, min_price: 30,  max_price: 60,  markup_pct: 22,  sort_order: 5 },
      { id: 6, min_price: 60,  max_price: 120, markup_pct: 16,  sort_order: 6 },
      { id: 7, min_price: 120, max_price: 200, markup_pct: 12,  sort_order: 7 },
      { id: 8, min_price: 200, max_price: null,markup_pct: 10,  sort_order: 8 }
    ]
    setRules(defaults)
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest">
          ⚙ Ρυθμίσεις Markup
        </h2>
        <button className="btn-secondary text-xs" onClick={reset}>
          Επαναφορά defaults
        </button>
      </div>

      <p className="text-slate-500 text-xs">
        Τιμή αγοράς χωρίς ΦΠΑ → ποσοστό markup. Αλλάξτε τα ποσοστά και πατήστε Αποθήκευση.
      </p>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-3 text-xs text-slate-500 uppercase px-3 pb-1">
          <span>Από (€)</span>
          <span>Έως (€)</span>
          <span>Markup %</span>
        </div>

        {rules.map((rule) => (
          <div
            key={rule.id}
            className="grid grid-cols-3 gap-2 items-center px-3 py-1.5 rounded-lg hover:bg-slate-700/30"
          >
            {/* min */}
            <input
              className="input text-xs py-1 font-mono"
              type="number" min="0" step="0.01"
              value={rule.min_price ?? ''}
              onChange={e => updateRule(rule.id, 'min_price', e.target.value)}
            />
            {/* max */}
            <input
              className="input text-xs py-1 font-mono"
              type="number" min="0" step="0.01"
              placeholder="∞"
              value={rule.max_price ?? ''}
              onChange={e => updateRule(rule.id, 'max_price', e.target.value)}
            />
            {/* markup */}
            <div className="relative">
              <input
                className="input text-xs py-1 font-mono pr-6"
                type="number" min="1" step="0.5"
                value={rule.markup_pct ?? ''}
                onChange={e => updateRule(rule.id, 'markup_pct', e.target.value)}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <button
        className="btn-primary w-full"
        onClick={handleSave}
      >
        {saved ? '✅ Αποθηκεύτηκε!' : '💾 Αποθήκευση Markup'}
      </button>
    </div>
  )
}
