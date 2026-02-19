import React, { useState } from 'react'
import useStore from '../store/useStore'

const STRATEGY_LABELS = {
  above_skroutz:  '📍 Λίγο πάνω από Skroutz',
  near_average:   '📊 Κοντά στον μέσο όρο',
  markup_minimum: '📐 Ελάχιστο markup'
}

export default function RecommendedPrice ({ priceCalc, productName }) {
  const resetForNext = useStore(s => s.resetForNext)
  const [copied, setCopied] = useState(false)

  if (!priceCalc) return null

  const {
    recommendedPrice,
    strategy,
    minSalePrice,
    markupPct,
    profitAmount,
    profitPercent,
    skroutzPrice,
    avgMarketPrice,
    priceExVat,
    vatAmount
  } = priceCalc

  const copyPrice = () => {
    navigator.clipboard.writeText(recommendedPrice.toFixed(2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card border-2 border-blue-500/40 space-y-4">
      {/* Product name */}
      {productName && (
        <p className="text-slate-400 text-sm truncate" title={productName}>
          📦 {productName}
        </p>
      )}

      {/* Strategy badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-300 border border-blue-700">
          {STRATEGY_LABELS[strategy] || strategy}
        </span>
      </div>

      {/* Hero Price */}
      <div className="text-center py-4">
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
          Προτεινόμενη Τιμή Πώλησης
        </p>
        <p className="text-6xl font-black text-white tracking-tight">
          €{recommendedPrice.toFixed(2)}
        </p>
      </div>

      {/* Price breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-700/50 rounded-lg p-2.5">
          <p className="text-slate-500 mb-0.5">Τιμή χωρίς ΦΠΑ</p>
          <p className="font-mono font-semibold text-slate-200">€{priceExVat?.toFixed(2)}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2.5">
          <p className="text-slate-500 mb-0.5">ΦΠΑ 24%</p>
          <p className="font-mono font-semibold text-slate-200">€{vatAmount?.toFixed(2)}</p>
        </div>
        <div className="bg-emerald-900/30 rounded-lg p-2.5 border border-emerald-800/50">
          <p className="text-slate-500 mb-0.5">Κέρδος</p>
          <p className="font-mono font-semibold text-emerald-400">
            €{profitAmount?.toFixed(2)} ({profitPercent}%)
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2.5">
          <p className="text-slate-500 mb-0.5">Markup ({markupPct}%)</p>
          <p className="font-mono font-semibold text-slate-200">min €{minSalePrice?.toFixed(2)}</p>
        </div>
        {skroutzPrice && (
          <div className="bg-orange-900/20 rounded-lg p-2.5 border border-orange-800/30">
            <p className="text-slate-500 mb-0.5">★ Skroutz</p>
            <p className="font-mono font-semibold text-orange-300">€{skroutzPrice.toFixed(2)}</p>
          </div>
        )}
        {avgMarketPrice && (
          <div className="bg-slate-700/50 rounded-lg p-2.5">
            <p className="text-slate-500 mb-0.5">Μέσος αγοράς</p>
            <p className="font-mono font-semibold text-slate-200">€{avgMarketPrice.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          className="btn-secondary flex-1 text-sm"
          onClick={copyPrice}
        >
          {copied ? '✅ Αντιγράφηκε!' : '📋 Αντιγραφή'}
        </button>
        <button
          className="btn-success flex-1 text-sm"
          onClick={resetForNext}
        >
          ➡ Επόμενο Προϊόν
        </button>
      </div>
    </div>
  )
}
