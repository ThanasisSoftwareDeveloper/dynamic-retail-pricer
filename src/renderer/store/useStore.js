/**
 * useStore.js — Global Zustand store
 */
import { create } from 'zustand'

const useStore = create((set, get) => ({

  // ── Search state ────────────────────────────────────────────────────────────
  query:       '',
  costNoVat:   '',
  isSearching: false,
  progress:    '',
  result:      null,   // last search result
  error:       null,

  setQuery:      (v) => set({ query: v }),
  setCostNoVat:  (v) => set({ costNoVat: v }),
  setProgress:   (v) => set({ progress: v }),

  // ── Search action ───────────────────────────────────────────────────────────
  doSearch: async () => {
    const { query, costNoVat } = get()
    if (!query.trim() || !costNoVat) return

    set({ isSearching: true, result: null, error: null, progress: '' })

    // Listen for progress updates
    const removeListener = window.api.onProgress((msg) => {
      set({ progress: msg })
    })

    try {
      const res = await window.api.searchPrices(
        query.trim(),
        parseFloat(costNoVat)
      )
      if (res.ok) {
        set({ result: res, error: null })
      } else {
        set({ error: res.error || 'Άγνωστο σφάλμα.' })
      }
    } catch (err) {
      set({ error: err.message })
    } finally {
      removeListener()
      set({ isSearching: false, progress: '' })
    }
  },

  // ── Reset for next product ──────────────────────────────────────────────────
  resetForNext: () => set({
    query:      '',
    costNoVat:  '',
    result:     null,
    error:      null,
    progress:   ''
  }),

  // ── Markup rules ─────────────────────────────────────────────────────────────
  markupRules:    [],
  loadMarkupRules: async () => {
    const rules = await window.api.getMarkupRules()
    set({ markupRules: rules })
  },
  saveMarkupRules: async (rules) => {
    await window.api.saveMarkupRules(rules)
    set({ markupRules: rules })
  },

  // ── UI panels ─────────────────────────────────────────────────────────────────
  activeTab: 'search',   // 'search' | 'settings' | 'history'
  setActiveTab: (tab) => set({ activeTab: tab })
}))

export default useStore
