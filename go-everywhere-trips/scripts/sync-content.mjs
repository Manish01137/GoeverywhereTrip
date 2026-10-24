// Pulls the content published from the live admin panel (SITE_URL/api/content.php) into
// src/data/live-content.json, so the build — prerendered pages, sitemap, checkout catalog —
// matches what's on the website. Offline or nothing published yet → keeps the current file.
import { readFileSync, writeFileSync } from 'node:fs'
import { SITE_URL } from '../src/site.config.js'

const file = new URL('../src/data/live-content.json', import.meta.url)

if (process.env.SKIP_SYNC) {
  console.log('• Content sync skipped (SKIP_SYNC)')
} else {
  try {
    const res = await fetch(`${SITE_URL}/api/content.php`, { signal: AbortSignal.timeout(10000) })
    if (res.status === 404) console.log('• Nothing published from admin yet — using built-in content')
    else if (!res.ok) throw new Error(`HTTP ${res.status}`)
    else {
      const data = await res.json()
      if (!Array.isArray(data.trips)) throw new Error('unexpected response')
      writeFileSync(file, JSON.stringify(data, null, 2))
      console.log(`✓ Synced live content from ${SITE_URL} (${data.trips.length} trips, ${data.blogs?.length || 0} blogs, saved ${data.savedAt || '?'})`)
    }
  } catch (e) {
    const prev = JSON.parse(readFileSync(file, 'utf8') || '{}')
    console.warn(`⚠ Could not sync content from ${SITE_URL} (${e.message}) — building with ${prev.trips ? 'the last synced copy' : 'built-in content'}`)
  }
}
