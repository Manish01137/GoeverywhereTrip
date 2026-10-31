// Room-sharing options and per-person prices.
// trip.sharing = { quad, triple, double, single } — price per person, or null/'' = not bookable online ("on request").
// Trips without sharing prices yet: Quad & Triple use the trip price; Double & Single stay "on request"
// until the admin sets their (usually higher) price — so nobody can book a single room at the shared price.
// Keep this logic in sync with sharing_prices() in public/api/payu/lib.php.

export const SHARING = [
  { id: 'quad', label: 'Quad sharing', short: 'Quad', note: '4 per room' },
  { id: 'triple', label: 'Triple sharing', short: 'Triple', note: '3 per room' },
  { id: 'double', label: 'Double sharing', short: 'Double', note: '2 per room' },
  { id: 'single', label: 'Single room', short: 'Single', note: 'Private room' },
]

export function sharingPrices(trip) {
  const base = Number(trip.price) || 0
  const s = trip.sharing || { quad: base, triple: base, double: null, single: null }
  return SHARING.map((o) => {
    const p = Number(s[o.id])
    return { ...o, price: p > 0 ? p : null }
  })
}

/** The cheapest option customers can book online — shown as "Starting from". */
export const fromPrice = (trip) => {
  const ps = sharingPrices(trip).map((o) => o.price).filter(Boolean)
  return ps.length ? Math.min(...ps) : Number(trip.price) || 0
}

/** Default selection: the cheapest bookable option. */
export const defaultSharing = (trip) => {
  const opts = sharingPrices(trip).filter((o) => o.price)
  return opts.sort((a, b) => a.price - b.price)[0]?.id || 'quad'
}
