import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { trips as builtInTrips, withDefaults } from '../data/trips'
import { blogs as builtInBlogs } from '../data/blogs'
import { reviews as builtInReviews } from '../data/reviews'
import live from '../data/live-content.json' // last published content, pulled in at build time (scripts/sync-content.mjs)
import { fetchContent, track } from '../lib/api'
import { withPopupDefaults } from '../data/popup'

// Content source of truth: the server (api/content.php, written by the admin panel).
// Until it loads — or if nothing has been published yet — the site uses the built-in content.

export const DEFAULT_SETTINGS = {
  heroTitle1: 'Book Your',
  heroTitle2: 'Trip to',
  heroSubtitle: 'Where the Himalaya meets great company',
  whatsapp: '919410776387',
  phoneDisplay: '+91 94107 76387',
  email: 'hello@goeverywheretrips.com',
  instagram: 'https://instagram.com/goeverywheretrips',
  youtube: 'https://youtube.com/@goeverywheretrips',
  address: 'Rajpur Road, Dehradun, Uttarakhand 248001',
}

const BUILT_IN = {
  trips: live.trips || builtInTrips,
  blogs: live.blogs || builtInBlogs,
  reviews: live.reviews || builtInReviews,
  settings: { ...DEFAULT_SETTINGS, ...(live.settings || {}) },
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [content, setContent] = useState(BUILT_IN)
  const [source, setSource] = useState('loading') // loading | server | built-in | offline
  const [rev, setRev] = useState(0) // bumps on every admin edit → AdminLayout publishes
  const loaded = useRef(false)

  useEffect(() => {
    // Old demo builds kept content in localStorage — clear it so it can't shadow the server.
    try { ['trips', 'blogs', 'reviews', 'leads', 'settings'].forEach((k) => localStorage.removeItem(`get-${k}-v2`)) } catch { /* ignore */ }
    fetchContent().then(({ state, data }) => {
      if (loaded.current) return
      loaded.current = true
      if (state === 'ok' && Array.isArray(data?.trips)) {
        setContent({ trips: data.trips, blogs: data.blogs || [], reviews: data.reviews || [], settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) } })
        setSource('server')
      } else setSource(state === 'empty' ? 'built-in' : 'offline')
    })
  }, [])

  // Admin setters: same API as useState setters, and they mark content as changed.
  const setter = (key) => (next) => {
    setContent((c) => ({ ...c, [key]: typeof next === 'function' ? next(c[key]) : next }))
    setRev((r) => r + 1)
  }
  const setTrips = useCallback(setter('trips'), [])
  const setBlogs = useCallback(setter('blogs'), [])
  const setReviews = useCallback(setter('reviews'), [])
  const setSettings = useCallback(setter('settings'), [])
  const replaceAll = useCallback((data) => setContent({ trips: data.trips, blogs: data.blogs || [], reviews: data.reviews || [], settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) } }), [])

  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...content.settings }), [content.settings])
  const popup = useMemo(() => withPopupDefaults(content.settings?.popup), [content.settings])
  const trips = useMemo(() => content.trips.map(withDefaults), [content.trips])
  const publicTrips = useMemo(() => trips.filter((t) => t.status !== 'Draft'), [trips])
  const publicBlogs = useMemo(() => content.blogs.filter((b) => b.status !== 'Draft'), [content.blogs])
  const publicReviews = useMemo(() => content.reviews.filter((r) => r.status !== 'Hidden'), [content.reviews])

  // Sends an enquiry to /api/lead.php (emails the team + logs it). Resolves to the server reply.
  const addLead = useCallback((lead) => {
    if (lead.source === 'whatsapp') { track(lead.enquiry); return Promise.resolve({ ok: true }) }
    return fetch('/api/lead.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, page: window.location.href }),
      keepalive: true,
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: 'network' }))
  }, [])

  const waLink = useCallback(
    (text = 'Hi! I want to know more about your trips') => `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`,
    [settings.whatsapp],
  )
  const trackWhatsApp = useCallback((context) => track(context), [])

  const value = {
    content, source, rev, replaceAll,
    trips, publicTrips, tripRecords: content.trips, setTrips,
    blogs: content.blogs, publicBlogs, setBlogs,
    reviews: content.reviews, publicReviews, setReviews,
    settings, setSettings, popup,
    addLead, waLink, trackWhatsApp,
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
