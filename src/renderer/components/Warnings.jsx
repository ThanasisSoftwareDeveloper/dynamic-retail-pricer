import React from 'react'

const ICONS = { info: 'ℹ', warning: '⚠', error: '✖', success: '✓' }
const STYLES = {
  info:    'tag-info',
  warning: 'tag-warning',
  error:   'tag-error',
  success: 'tag-success'
}

export default function Warnings ({ warnings }) {
  if (!warnings?.length) return null

  return (
    <div className="space-y-1.5">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${STYLES[w.type] || STYLES.info}`}
        >
          <span className="shrink-0 mt-0.5">{ICONS[w.type]}</span>
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  )
}
