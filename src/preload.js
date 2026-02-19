/**
 * preload.js
 * Exposes a safe, typed API to the React renderer via contextBridge.
 * The renderer NEVER has direct access to Node.js or Electron internals.
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {

  // ── Price Search ────────────────────────────────────────────────────────────
  searchPrices: (query, costNoVat) =>
    ipcRenderer.invoke('search:prices', { query, costNoVat }),

  // ── Progress updates (from main → renderer during scraping) ────────────────
  onProgress: (callback) => {
    ipcRenderer.on('search:progress', (_event, message) => callback(message))
    return () => ipcRenderer.removeAllListeners('search:progress')
  },

  // ── Markup Rules ─────────────────────────────────────────────────────────────
  getMarkupRules: () =>
    ipcRenderer.invoke('markup:getRules'),

  saveMarkupRules: (rules) =>
    ipcRenderer.invoke('markup:saveRules', rules),

  // ── History ──────────────────────────────────────────────────────────────────
  getHistory: (limit) =>
    ipcRenderer.invoke('history:get', limit),

  // ── Settings ─────────────────────────────────────────────────────────────────
  getSettings: () =>
    ipcRenderer.invoke('settings:getAll'),

  saveSetting: (key, value) =>
    ipcRenderer.invoke('settings:save', { key, value }),

  // ── Utility ──────────────────────────────────────────────────────────────────
  openExternal: (url) =>
    ipcRenderer.invoke('shell:openExternal', url)
})
