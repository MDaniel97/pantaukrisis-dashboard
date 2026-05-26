// In dev: Vite proxy forwards /api/* → http://localhost:8000
// In production: __API_URL__ is replaced at build time with VITE_API_URL
const API_BASE = __API_URL__

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

export const fetchFuelLatest = () => get('/api/fuel/latest')
export const fetchFuelHistory = (weeks = 12) => get(`/api/fuel/history?weeks=${weeks}`)
export const fetchCommodities = () => get('/api/commodities')
export const fetchMacro = () => get('/api/macro')
export const fetchMyrHistory = (days = 90) => get(`/api/macro/myr-usd/history?days=${days}`)
