// In dev: Vite proxy forwards /api/* → http://localhost:8000
// In production: __API_URL__ is replaced at build time with VITE_API_URL from the environment
const API_BASE = __API_URL__

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

/** Latest RON95 / RON97 / Diesel prices */
export const fetchFuelLatest = () => get('/api/fuel/latest')

/** Price history for the last N weeks */
export const fetchFuelHistory = (weeks = 12) => get(`/api/fuel/history?weeks=${weeks}`)

/** Commodity prices with MoM change */
export const fetchCommodities = () => get('/api/commodities')

/** Full DOSM item lookup table (for exploration) */
export const fetchCommodityLookup = () => get('/api/commodities/lookup')
