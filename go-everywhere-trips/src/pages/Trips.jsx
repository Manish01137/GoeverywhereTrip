import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import Seo from '../components/ui/Seo'
import TripCard from '../components/ui/TripCard'
import Modal from '../components/ui/Modal'
import MountainArt from '../components/ui/MountainArt'
import Button from '../components/ui/Button'
import { useData } from '../context/DataContext'
import { TRIP_TYPES } from '../data/trips'
import { IMAGES } from '../data/images'
import { inr, monthKey } from '../lib/format'

const PAGE_SIZE = 6
const TYPE_LABEL = { 'Group Tour': 'Group', Trek: 'Trek', Custom: 'Custom', Spiritual: 'Spiritual', Weekend: 'Weekend' }
const DURATIONS = [
  { id: '1-3', label: '1–3 Days', test: (d) => d <= 3 },
  { id: '4-6', label: '4–6 Days', test: (d) => d >= 4 && d <= 6 },
  { id: '7-10', label: '7–10 Days', test: (d) => d >= 7 && d <= 10 },
  { id: '10+', label: '10+ Days', test: (d) => d > 10 },
]
const SORTS = [
  { id: 'popular', label: 'Most Popular', fn: (a, b) => b.reviews - a.reviews },
  { id: 'price-asc', label: 'Price: Low to High', fn: (a, b) => a.price - b.price },
  { id: 'price-desc', label: 'Price: High to Low', fn: (a, b) => b.price - a.price },
  { id: 'rating', label: 'Top Rated', fn: (a, b) => b.rating - a.rating },
  { id: 'soonest', label: 'Departing Soonest', fn: (a, b) => (a.nextDeparture || '9').localeCompare(b.nextDeparture || '9') },
]

function nextMonths(n) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) }
  })
}

// All filter state lives in the URL so links like /trips?type=Trek work and the back button behaves.
function useTripFilters(maxPrice) {
  const [params, setParams] = useSearchParams()
  const f = {
    destination: params.getAll('destination'),
    type: params.getAll('type'),
    duration: params.get('duration') || '',
    budget: Number(params.get('budget')) || maxPrice,
    month: params.getAll('month'),
    group: params.get('group') || 'All',
    search: params.get('search') || '',
    sort: params.get('sort') || 'popular',
  }

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    next.delete(key)
    const empty = value === '' || value == null || value === 'All' || (key === 'budget' && value >= maxPrice) || (key === 'sort' && value === 'popular')
    if (Array.isArray(value)) value.forEach((v) => next.append(key, v))
    else if (!empty) next.set(key, value)
    setParams(next, { replace: true })
  }
  const toggle = (key, v) => set(key, f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v])
  const clear = () => setParams(f.sort !== 'popular' ? { sort: f.sort } : {}, { replace: true })

  return { f, set, toggle, clear, key: params.toString() }
}

export default function Trips() {
  const { publicTrips } = useData()
  const maxPrice = useMemo(() => Math.ceil(Math.max(30000, ...publicTrips.map((t) => t.price)) / 5000) * 5000, [publicTrips])
  const destinations = useMemo(() => [...new Set(publicTrips.map((t) => t.destination))].sort(), [publicTrips])
  const months = useMemo(() => nextMonths(6), [])
  const { f, set, toggle, clear, key: filterKey } = useTripFilters(maxPrice)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const results = useMemo(() => {
    const q = f.search.trim().toLowerCase()
    const dur = DURATIONS.find((d) => d.id === f.duration)
    const sort = SORTS.find((s) => s.id === f.sort) || SORTS[0]
    return publicTrips
      .filter((t) => !f.destination.length || f.destination.includes(t.destination))
      .filter((t) => !f.type.length || f.type.includes(t.type))
      .filter((t) => !dur || dur.test(t.durationDays))
      .filter((t) => t.price <= f.budget)
      .filter((t) => !f.month.length || t.departures.some((d) => f.month.includes(monthKey(d.date))))
      .filter((t) => f.group === 'All' || t.groupType === f.group)
      .filter((t) => !q || [t.name, t.destination, t.type, ...t.places, ...t.highlights].join(' ').toLowerCase().includes(q))
      .sort(sort.fn)
  }, [publicTrips, f.search, f.duration, f.sort, f.destination, f.type, f.budget, f.month, f.group])

  useEffect(() => setVisible(PAGE_SIZE), [filterKey])

  const chips = [
    ...f.destination.map((v) => ({ id: `d-${v}`, label: v, remove: () => toggle('destination', v) })),
    ...f.type.map((v) => ({ id: `t-${v}`, label: v, remove: () => toggle('type', v) })),
    ...(f.duration ? [{ id: 'dur', label: DURATIONS.find((d) => d.id === f.duration)?.label, remove: () => set('duration', '') }] : []),
    ...(f.budget < maxPrice ? [{ id: 'bud', label: `Under ${inr(f.budget)}`, remove: () => set('budget', maxPrice) }] : []),
    ...f.month.map((v) => ({ id: `m-${v}`, label: months.find((m) => m.key === v)?.label || v, remove: () => toggle('month', v) })),
    ...(f.group !== 'All' ? [{ id: 'grp', label: f.group, remove: () => set('group', 'All') }] : []),
    ...(f.search ? [{ id: 'q', label: `“${f.search}”`, remove: () => set('search', '') }] : []),
  ]

  const loadMore = () => {
    setLoadingMore(true)
    setTimeout(() => { setVisible((v) => v + PAGE_SIZE); setLoadingMore(false) }, 500)
  }

  const panel = (
    <FilterPanel {...{ f, set, toggle, clear, destinations, months, maxPrice }} />
  )

  return (
    <>
      <Seo title="All Trips — Treks, Group Tours & Yatras" description="Browse fixed-departure treks, group tours, weekend getaways and spiritual yatras from Dehradun. Filter by destination, budget, duration and month." image={IMAGES.treks} />

      <section className="relative overflow-hidden bg-deep py-14 text-white" style={{ backgroundImage: `linear-gradient(rgba(12,74,110,.85),rgba(12,74,110,.9)), url(${IMAGES.heroAlt})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container-x">
          <h1 className="text-4xl font-black md:text-5xl">Find Your Next Trip</h1>
          <p className="mt-2 text-sky-100">{publicTrips.length} handpicked journeys across the Himalaya and beyond.</p>
          <label htmlFor="trip-search" className="sr-only">Search trips</label>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input
              id="trip-search"
              type="search"
              value={f.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Search Kedarnath, Spiti, Chopta…"
              className="w-full rounded-pill border-0 bg-white py-3.5 pl-11 pr-4 text-slate-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-brand/40"
            />
          </div>
        </div>
      </section>

      <div className="container-x grid grid-cols-1 gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-5">{panel}</div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              Showing <strong className="text-slate-900 dark:text-white">{results.length}</strong> {results.length === 1 ? 'trip' : 'trips'}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSheetOpen(true)} className="inline-flex items-center gap-2 rounded-pill border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-deep lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <SlidersHorizontal size={16} /> Filter & Sort {chips.length > 0 && <span className="rounded-full bg-sky-brand px-1.5 text-xs text-white">{chips.length}</span>}
              </button>
              <label htmlFor="sort" className="sr-only">Sort trips</label>
              <select id="sort" value={f.sort} onChange={(e) => set('sort', e.target.value)} className="rounded-pill border border-slate-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-brand dark:border-slate-700 dark:bg-slate-800">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <motion.div layout className="mb-5 flex flex-wrap gap-2">
            <AnimatePresence>
              {chips.map((c) => (
                <motion.span key={c.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1 rounded-pill bg-sky-light px-3 py-1 text-sm text-sky-dark dark:bg-sky-500/15 dark:text-sky-300">
                  {c.label}
                  <button type="button" onClick={c.remove} aria-label={`Remove filter ${c.label}`} className="rounded-full p-0.5 hover:bg-sky-brand hover:text-white"><X size={12} /></button>
                </motion.span>
              ))}
              {chips.length > 1 && (
                <motion.button key="clear" layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} type="button" onClick={clear} className="px-2 text-sm font-semibold text-accent hover:underline">
                  Clear all
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {results.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center px-6 py-16 text-center">
              <MountainArt className="w-56" float />
              <h2 className="mt-6 text-xl font-bold text-deep dark:text-white">No trips match those filters</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">Try widening your budget or dates — or tell us what you want and we’ll build it for you.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={clear} variant="ghost">Clear filters</Button>
                <Button to="/custom-trip">Plan a Custom Trip</Button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {results.slice(0, visible).map((t) => (
                    <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }} className="flex">
                      <TripCard trip={t} className="w-full" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              {visible < results.length && (
                <div className="mt-10 text-center">
                  <Button onClick={loadMore} variant="ghost" disabled={loadingMore}>
                    {loadingMore ? <><Loader2 size={16} className="animate-spin" /> Loading…</> : `Load More (${results.length - visible} more)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter & Sort"
        variant="sheet"
        footer={<Button className="w-full" onClick={() => setSheetOpen(false)}>Show {results.length} trips</Button>}
      >
        <label htmlFor="sort-m" className="label">Sort by</label>
        <select id="sort-m" value={f.sort} onChange={(e) => set('sort', e.target.value)} className="input mb-4">
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        {panel}
      </Modal>
    </>
  )
}

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 py-4 last:border-0 dark:border-slate-700">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-sm font-bold text-deep dark:text-white">
        {title}
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const pill = (on) =>
  `rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors ${
    on ? 'border-sky-brand bg-sky-brand text-white' : 'border-slate-200 text-slate-600 hover:border-sky-brand hover:text-sky-dark dark:border-slate-600 dark:text-slate-300'
  }`

function FilterPanel({ f, set, toggle, clear, destinations, months, maxPrice }) {
  return (
    <div>
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-bold text-deep dark:text-white">Filters</h2>
        <button type="button" onClick={clear} className="text-xs font-semibold text-accent hover:underline">Clear All</button>
      </div>

      <FilterGroup title="Destination">
        <div className="space-y-2">
          {destinations.map((d) => (
            <label key={d} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={f.destination.includes(d)} onChange={() => toggle('destination', d)} className="h-4 w-4 rounded border-slate-300 accent-sky-brand" />
              {d}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Trip Type">
        <div className="flex flex-wrap gap-2">
          {TRIP_TYPES.map((t) => (
            <button key={t} type="button" aria-pressed={f.type.includes(t)} onClick={() => toggle('type', t)} className={pill(f.type.includes(t))}>{TYPE_LABEL[t]}</button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Duration">
        <fieldset className="space-y-2">
          <legend className="sr-only">Duration</legend>
          {DURATIONS.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <input type="radio" name="duration" checked={f.duration === d.id} onChange={() => set('duration', d.id)} onClick={() => f.duration === d.id && set('duration', '')} className="h-4 w-4 accent-sky-brand" />
              {d.label}
            </label>
          ))}
        </fieldset>
      </FilterGroup>

      <FilterGroup title="Budget">
        <label htmlFor="budget" className="sr-only">Maximum budget per person</label>
        <input id="budget" type="range" min={2000} max={maxPrice} step={500} value={f.budget} onChange={(e) => set('budget', Number(e.target.value))} className="w-full accent-sky-brand" />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>₹2,000</span>
          <span className="font-bold text-sky-dark dark:text-sky-300">Up to {inr(f.budget)}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Month">
        <div className="grid grid-cols-3 gap-2">
          {months.map((m) => (
            <button key={m.key} type="button" aria-pressed={f.month.includes(m.key)} onClick={() => toggle('month', m.key)} className={pill(f.month.includes(m.key))}>{m.label}</button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Group / Private">
        <div className="grid grid-cols-3 gap-1 rounded-pill bg-slate-100 p-1 dark:bg-slate-700">
          {['All', 'Group', 'Private'].map((g) => (
            <button key={g} type="button" aria-pressed={f.group === g} onClick={() => set('group', g)} className={`rounded-pill py-1.5 text-xs font-semibold transition-colors ${f.group === g ? 'bg-white text-sky-dark shadow dark:bg-slate-900 dark:text-sky-300' : 'text-slate-500 dark:text-slate-300'}`}>
              {g}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  )
}
