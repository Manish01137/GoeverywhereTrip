// Exports trip prices + departure dates for the PHP checkout so amounts are decided server-side.
import { writeFileSync } from 'node:fs'
import { trips } from './content-source.mjs'

const catalog = Object.fromEntries(
  trips
    .filter((t) => t.status !== 'Draft')
    .map((t) => [t.slug, { name: t.name, price: t.price, departures: (t.departures || []).map((d) => d.date) }]),
)
writeFileSync(new URL('../public/api/payu/catalog.json', import.meta.url), JSON.stringify(catalog, null, 2))
console.log(`PayU catalog: ${Object.keys(catalog).length} trips`)
