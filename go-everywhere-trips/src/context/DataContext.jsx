import { createContext, useCallback, useContext, useMemo } from 'react'
import { trips as defaultTrips, withDefaults } from '../data/trips'
import { blogs as defaultBlogs } from '../data/blogs'
import { reviews as defaultReviews } from '../data/reviews'
import { usePersistentState } from '../lib/storage'

// Demo CMS: everything the admin panel edits lives in localStorage and feeds the public site.

// Bump when the shape of stored data changes so old browser copies are ignored.
const V = 'v2'
export const DATA_KEYS = ['trips', 'blogs', 'reviews', 'leads', 'settings'].map((k) => `get-${k}-${V}`)
const [K_TRIPS, K_BLOGS, K_REVIEWS, K_LEADS, K_SETTINGS] = DATA_KEYS

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

const SEED_LEADS = [
  { id: 101, source: 'custom',   name: 'Ritika Verma',  phone: '9876543210', email: 'ritika@example.com', enquiry: 'Custom trip · Spiti · 6 people · Deluxe',   date: '2026-09-29T10:12:00', status: 'New' },
  { id: 102, source: 'contact',  name: 'Manav Chauhan', phone: '9812345678', email: 'manav@example.com',  enquiry: 'Corporate offsite for 25 people in Rishikesh', date: '2026-09-28T16:40:00', status: 'Contacted' },
  { id: 103, source: 'whatsapp', name: '—',             phone: '—',          email: '—',                  enquiry: 'Trip card · Harshil Valley Group Trek',      date: '2026-09-28T09:05:00', status: 'New' },
  { id: 104, source: 'custom',   name: 'Deepak Rana',   phone: '9998887776', email: 'deepak@example.com', enquiry: 'Custom trip · Rajasthan · 4 people · Luxury', date: '2026-09-26T13:20:00', status: 'Converted' },
  { id: 105, source: 'contact',  name: 'Isha Kapoor',   phone: '9090909090', email: 'isha@example.com',   enquiry: 'Do you have a women-only Chopta batch?',     date: '2026-09-25T19:55:00', status: 'Contacted' },
]

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [rawTrips, setTrips] = usePersistentState(K_TRIPS, defaultTrips)
  const [blogs, setBlogs] = usePersistentState(K_BLOGS, defaultBlogs)
  const [reviews, setReviews] = usePersistentState(K_REVIEWS, defaultReviews)
  const [leads, setLeads] = usePersistentState(K_LEADS, SEED_LEADS)
  const [storedSettings, setSettings] = usePersistentState(K_SETTINGS, DEFAULT_SETTINGS)

  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...storedSettings }), [storedSettings])
  const trips = useMemo(() => rawTrips.map(withDefaults), [rawTrips])
  const publicTrips = useMemo(() => trips.filter((t) => t.status !== 'Draft'), [trips])
  const publicBlogs = useMemo(() => blogs.filter((b) => b.status !== 'Draft'), [blogs])
  const publicReviews = useMemo(() => reviews.filter((r) => r.status !== 'Hidden'), [reviews])

  const addLead = useCallback(
    (lead) => setLeads((ls) => [{ id: Date.now(), date: new Date().toISOString(), status: 'New', ...lead }, ...ls]),
    [setLeads],
  )

  const waLink = useCallback(
    (text = 'Hi! I want to know more about your trips') =>
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`,
    [settings.whatsapp],
  )

  // Fire-and-forget click tracking so WhatsApp enquiries show up in Admin → Leads.
  const trackWhatsApp = useCallback(
    (context) => addLead({ source: 'whatsapp', name: '—', phone: '—', email: '—', enquiry: context }),
    [addLead],
  )

  const value = {
    trips, publicTrips, tripRecords: rawTrips, setTrips,
    blogs, publicBlogs, setBlogs,
    reviews, publicReviews, setReviews,
    leads, setLeads, addLead,
    settings, setSettings,
    waLink, trackWhatsApp,
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
