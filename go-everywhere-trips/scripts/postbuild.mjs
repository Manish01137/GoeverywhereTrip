// Runs after `vite build`:
//   1. writes sitemap.xml + robots.txt
//   2. keeps an untouched SPA shell as app.html (served for /admin and unknown URLs)
//   3. prerenders every public page to static HTML with headless Chrome, so Google,
//      WhatsApp/Facebook link previews and slow phones get real content immediately.
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { preview } from 'vite'
import { trips, blogs } from './content-source.mjs'
import { SITE_URL } from '../src/site.config.js'

const DIST = new URL('../dist/', import.meta.url).pathname
const today = new Date().toISOString().slice(0, 10)

const routes = [
  { path: '/', priority: '1.0', freq: 'daily' },
  { path: '/trips', priority: '0.9', freq: 'daily' },
  ...trips.filter((t) => t.status !== 'Draft').map((t) => ({ path: `/trips/${t.slug}`, priority: '0.9', freq: 'weekly' })),
  { path: '/custom-trip', priority: '0.7', freq: 'monthly' },
  { path: '/blogs', priority: '0.7', freq: 'weekly' },
  ...blogs.filter((b) => b.status !== 'Draft').map((b) => ({ path: `/blogs/${b.slug}`, priority: '0.6', freq: 'monthly', lastmod: b.date })),
  { path: '/about', priority: '0.5', freq: 'monthly' },
  { path: '/contact', priority: '0.5', freq: 'monthly' },
]

// 1. sitemap + robots
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${SITE_URL}${r.path}</loc><lastmod>${r.lastmod || today}</lastmod><changefreq>${r.freq}</changefreq><priority>${r.priority}</priority></url>`).join('\n')}
</urlset>
`)
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /payment/

Sitemap: ${SITE_URL}/sitemap.xml
`)
console.log(`✓ sitemap.xml (${routes.length} URLs) + robots.txt for ${SITE_URL}`)

// 2. pristine SPA shell
copyFileSync(join(DIST, 'index.html'), join(DIST, 'app.html'))

// 3. prerender
const chrome = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find((p) => p && existsSync(p))

if (!chrome) {
  console.warn('⚠ Chrome not found — skipped prerendering (site still works; set CHROME_PATH to enable).')
  process.exit(0)
}

const { chromium } = await import('playwright-core')
const server = await preview({ preview: { port: 4317, strictPort: false }, logLevel: 'silent' })
const base = server.resolvedUrls.local[0].replace(/\/$/, '')
const browser = await chromium.launch({ executablePath: chrome })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' })
const page = await ctx.newPage()
const pages = {}
let failed = 0

for (const { path } of routes) {
  try {
    await page.goto(base + path, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('main#main h1', { timeout: 15000 })
    await page.waitForFunction(() => !document.querySelector('[aria-label="Loading Go Everywhere Trips"]'), null, { timeout: 5000 })
    // Scroll through so every "animate when visible" block renders in its final state.
    const height = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < height; y += 600) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(60) }
    await page.waitForTimeout(900)
    await page.evaluate(() => window.scrollTo(0, 0))
    pages[path] = await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      // Helmet adds page-specific tags marked data-rh; drop the shell's generic duplicates.
      if (document.head.querySelector('meta[name="description"][data-rh]')) {
        document.head.querySelectorAll('meta[name="description"]:not([data-rh])').forEach((n) => n.remove())
      }
      const titles = [...document.head.querySelectorAll('title')]
      titles.slice(0, -1).forEach((n) => n.remove()) // keep the last (page-specific) title
      document.getElementById('root').setAttribute('data-prerendered', '')
      return '<!doctype html>\n' + document.documentElement.outerHTML
    })
    // Vite injects runtime <link rel="modulepreload"> tags with the preview server's origin — make them relative.
    pages[path] = pages[path].replaceAll(encodeURIComponent(base), encodeURIComponent(SITE_URL)).replaceAll(base, '')
    process.stdout.write('.')
  } catch (e) {
    failed++
    console.warn(`\n  ⚠ could not prerender ${path}: ${e.message.split('\n')[0]}`)
  }
}
await browser.close()
await new Promise((r) => server.httpServer.close(r))

for (const [path, html] of Object.entries(pages)) {
  const file = path === '/' ? join(DIST, 'index.html') : join(DIST, `${path.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}
console.log(`\n✓ prerendered ${Object.keys(pages).length}/${routes.length} pages${failed ? ` (${failed} failed — they still work as normal app pages)` : ''}`)
