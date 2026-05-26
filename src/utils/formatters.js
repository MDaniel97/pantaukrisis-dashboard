export function pct(v, decimals = 1) {
  if (v == null) return null
  return `${v > 0 ? '+' : ''}${Number(v).toFixed(decimals)}%`
}

export function pp(v) {
  if (v == null) return null
  return `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}pp`
}

export function trend(v) {
  return v == null ? 'flat' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat'
}
