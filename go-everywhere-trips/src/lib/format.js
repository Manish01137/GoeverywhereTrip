export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(d + (String(d).length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-IN', opts)

export const monthKey = (d) => String(d).slice(0, 7) // "2026-10"

export const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Departures that haven't happened yet, earliest first.
export const upcoming = (departures = []) => {
  const today = new Date().toISOString().slice(0, 10)
  return [...departures].filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date))
}

export const seatTone = (seats) =>
  seats <= 3
    ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
    : seats <= 7
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
      : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
