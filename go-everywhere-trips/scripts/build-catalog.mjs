// Exports trip prices + departure dates for the PHP checkout so amounts are decided server-side.
import { writeFileSync } from 'node:fs'
import { trips } from './content-source.mjs'
import { sharingPrices } from '../src/lib/sharing.js'

const catalog = Object.fromEntries(
  trips
    .filter((t) => t.status !== 'Draft')
    .map((t) => [t.slug, { name: t.name, price: t.price, sharing: Object.fromEntries(sharingPrices(t).map((o) => [o.id, o.price])), departures: (t.departures || []).map((d) => d.date) }]),
)
writeFileSync(new URL('../public/api/payu/catalog.json', import.meta.url), JSON.stringify(catalog, null, 2))
console.log(`PayU catalog: ${Object.keys(catalog).length} trips`)
