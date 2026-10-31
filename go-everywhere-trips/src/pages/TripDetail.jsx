import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  BedDouble, Bus, Calendar, Download, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Copy, Images, MapPin,
  Minus, Mountain, Phone, Plus, Share2, ShieldCheck, Sparkles, Star, Sun, Tent, Trees, Users, Waves, X, XCircle,
} from 'lucide-react'
import Seo from '../components/ui/Seo'
import Img from '../components/ui/Img'
import Stars from '../components/ui/Stars'
import PosterTripCard from '../components/ui/PosterTripCard'
import Badge from '../components/ui/Badge'
import MountainArt from '../components/ui/MountainArt'
import Button from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { useFocusTrap } from '../components/ui/Modal'
import ReviewCard from '../components/ui/ReviewCard'
import CheckoutModal from '../components/booking/CheckoutModal'
import DateCalendar from '../components/booking/DateCalendar'
import ShareTrip from '../components/booking/ShareTrip'
import { defaultSharing, fromPrice, sharingPrices } from '../lib/sharing'
import { WhatsAppIcon } from '../components/ui/BrandIcons'
import { useData } from '../context/DataContext'
import { CANCELLATION_POLICY } from '../data/trips'
import { driveView, img, large } from '../data/images'
import { fmtDate, inr, seatTone, upcoming } from '../lib/format'
import { ADVANCE_PERCENT, SITE_URL } from '../site.config'
import { breadcrumbs, faqPage, touristTrip } from '../lib/schema'

// Accepts youtube.com/watch?v=, youtu.be/, /shorts/ and /embed/ links.
const youtubeId = (url = '') => (String(url).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/) || [])[1]

const HIGHLIGHT_ICONS = [Mountain, Trees, Waves, Tent, Sun, Sparkles]

const addDays = (date, n) => {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// Booking card renders twice (inline on mobile, sticky on desktop); scroll to whichever is visible.
const scrollToBook = () => {
  const el = [...document.querySelectorAll('[data-book]')].find((n) => n.offsetParent !== null)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export default function TripDetail() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const { hash } = useLocation()
  const { publicTrips, publicReviews, waLink, trackWhatsApp, settings } = useData()
  const trip = publicTrips.find((t) => t.slug === slug)

  const dates = useMemo(() => upcoming(trip?.departures), [trip])
  const [date, setDate] = useState(() => params.get('date') || '')
  const [people, setPeople] = useState(2)
  const [sharing, setSharing] = useState(() => (trip ? defaultSharing(trip) : 'quad'))
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (hash === '#book') setTimeout(scrollToBook, 350)
  }, [hash])

  if (!trip) {
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <Seo title="Trip not found" noindex />
        <MountainArt className="w-56" float />
        <h1 className="mt-6 text-2xl font-bold text-deep dark:text-white">We couldn’t find that trip</h1>
        <p className="mt-2 text-slate-500">It may have been renamed or retired for the season.</p>
        <Button to="/trips" className="mt-6">Browse all trips</Button>
      </div>
    )
  }

  const gallery = trip.gallery.map((g) => large(img(g)))
  const tripReviews = publicReviews.filter((r) => r.trip === trip.name)
  const reviewsToShow = (tripReviews.length ? tripReviews : publicReviews).slice(0, 3)
  const similar = publicTrips.filter((t) => t.id !== trip.id && (t.type === trip.type || t.destination === trip.destination)).slice(0, 3)
  const fallbackSimilar = similar.length ? similar : publicTrips.filter((t) => t.id !== trip.id).slice(0, 3)
  const pickDate = (d) => { setDate(d); scrollToBook() }
  const enquiry = `Hi, I'm interested in ${trip.name}`

  const booking = { trip, dates, date, setDate, people, setPeople, sharing, setSharing }

  return (
    <>
      <Seo
        title={`${trip.name} — ${trip.duration}`}
        description={`${trip.name}: ${trip.duration} ${trip.type.toLowerCase()} in ${trip.destination} from ${trip.startingPoint}, ${inr(trip.price)}/person. ${trip.highlights.slice(0, 3).join(', ')}. ${trip.rating}★ from ${trip.reviews} travellers.`}
        image={gallery[0]}
        jsonLd={[
          touristTrip(trip),
          breadcrumbs([['Home', '/'], ['Trips', '/trips'], [trip.name, `/trips/${trip.slug}`]]),
          faqPage(trip.faqs),
        ]}
      />

      <div className="container-x pb-16 pt-6">
        {/* 1. Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 text-slate-500">
            <li><Link to="/" className="hover:text-sky-brand">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link to="/trips" className="hover:text-sky-brand">Trips</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link to={`/trips?type=${encodeURIComponent(trip.type)}`} className="hover:text-sky-brand">{trip.type}</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-semibold text-sky-brand">{trip.name}</li>
          </ol>
        </nav>

        {/* 2. Gallery */}
        <div className="grid h-72 grid-cols-3 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-[26rem] md:grid-cols-4">
          {gallery.slice(0, 5).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setLightbox(i)}
              aria-label={`Open photo ${i + 1} of ${gallery.length}`}
              className={`group relative overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-brand ${i === 0 ? 'col-span-2 row-span-2' : ''} ${i > 2 ? 'hidden md:block' : ''}`}
            >
              <Img src={src} alt="" eager={i === 0} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {i === 4 && gallery.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-deep/60 text-lg font-bold text-white">
                  <Images size={20} aria-hidden="true" /> +{gallery.length - 5} more
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-10">
            {/* 3. Header */}
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{trip.type}</Badge>
                {trip.badge && <Badge tone="white" className="ring-1 ring-slate-200">{trip.badge}</Badge>}
                {dates[0]?.seats <= 5 && <Badge tone="accent" className="animate-pulse">Only {dates[0].seats} seats left!</Badge>}
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <h1 className="text-3xl font-black leading-tight text-deep md:text-4xl dark:text-white">{trip.name}</h1>
                <ShareTrip trip={trip} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5"><Clock size={16} className="text-sky-brand" />{trip.duration}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-sky-brand" />Starts {trip.startingPoint}</span>
                <span className="inline-flex items-center gap-1.5"><Users size={16} className="text-sky-brand" />{trip.groupType} trip</span>
                <span className="inline-flex items-center gap-1.5"><Stars rating={trip.rating} /> <strong>{trip.rating}</strong> ({trip.reviews} reviews)</span>
              </div>
              {trip.description && <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">{trip.description}</p>}
              {trip.brochure && (
                <a href={driveView(trip.brochure)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-pill border-2 border-sky-brand px-5 py-2.5 text-sm font-bold text-sky-dark transition-colors hover:bg-sky-brand hover:text-white dark:text-sky-300">
                  <Download size={16} aria-hidden="true" /> Download itinerary (PDF)
                </a>
              )}
            </header>

            {/* Mobile booking card */}
            <div className="lg:hidden"><BookingCard id="m" {...booking} /></div>

            {youtubeId(trip.video) && (
              <Block title="Watch the Trip">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId(trip.video)}?rel=0`}
                    title={`${trip.name} video`}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </Block>
            )}

            {/* 4. Highlights */}
            <Block title="Trip Highlights">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {trip.highlights.map((h, i) => {
                  const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]
                  return (
                    <div key={h} className="flex items-center gap-3 rounded-xl bg-sky-light/60 p-3 dark:bg-slate-800">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-brand text-white"><Icon size={16} aria-hidden="true" /></span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{h}</span>
                    </div>
                  )
                })}
              </div>
            </Block>

            {/* 5. Dates */}
            <Block title="Upcoming Dates">
              {dates.length === 0 ? (
                <p className="text-slate-500">No fixed dates right now — <a href={waLink(enquiry)} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-brand hover:underline">ask us on WhatsApp</a> for a private departure.</p>
              ) : (
                <>
                {/* Phones: stacked cards */}
                <ul className="space-y-3 md:hidden">
                  {dates.map((d) => (
                    <li key={d.date} className={`card flex items-center justify-between gap-3 p-4 ${date === d.date ? 'ring-2 ring-sky-brand' : ''}`}>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">{fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })} → {fmtDate(addDays(d.date, trip.durationDays - 1), { day: 'numeric', month: 'short' })}</p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-bold text-sky-brand">{inr(fromPrice(trip))}</span>
                          <span className={`whitespace-nowrap rounded-pill px-2 py-0.5 text-xs font-bold ${seatTone(d.seats)}`}>{d.seats === 0 ? 'Sold out' : `${d.seats} left`}</span>
                        </p>
                      </div>
                      <button type="button" onClick={() => pickDate(d.date)} disabled={d.seats === 0} className="shrink-0 rounded-pill bg-sky-brand px-5 py-2 text-sm font-bold text-white hover:bg-sky-dark disabled:bg-slate-300">
                        {d.seats === 0 ? 'Full' : 'Book'}
                      </button>
                    </li>
                  ))}
                </ul>
                {/* Tablet & desktop: table */}
                <div className="card hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-deep text-white">
                      <tr>{['Departure', 'Return', 'Seats', 'Price', ''].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {dates.map((d) => (
                        <tr key={d.date} className={`odd:bg-white even:bg-sky-xlight dark:odd:bg-slate-800 dark:even:bg-slate-800/60 ${date === d.date ? 'ring-2 ring-inset ring-sky-brand' : ''}`}>
                          <td className="px-4 py-3 font-semibold">{fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-3 text-slate-500">{fmtDate(addDays(d.date, trip.durationDays - 1))}</td>
                          <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-bold ${seatTone(d.seats)}`}>{d.seats} left</span></td>
                          <td className="px-4 py-3 font-bold text-sky-brand">from {inr(fromPrice(trip))}</td>
                          <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => pickDate(d.date)} disabled={d.seats === 0} className="rounded-pill bg-sky-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-dark disabled:bg-slate-300">
                              {d.seats === 0 ? 'Sold out' : 'Book'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </Block>

            {/* 6. Itinerary */}
            {trip.itinerary.length > 0 && (
              <Block title="Day-wise Itinerary">
                <ol className="space-y-3">
                  {trip.itinerary.map((day, i) => (
                    <Accordion as="li" key={i} defaultOpen={i === 0} title={<><span className="mr-3 inline-flex h-8 min-w-[3.5rem] items-center justify-center rounded-pill bg-sky-brand px-2 text-xs font-bold text-white">Day {i + 1}</span>{day.title}</>}>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{day.desc}</p>
                      {day.activities?.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {day.activities.map((a) => (
                            <li key={a} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><Check size={16} className="mt-0.5 shrink-0 text-sky-brand" aria-hidden="true" />{a}</li>
                          ))}
                        </ul>
                      )}
                    </Accordion>
                  ))}
                </ol>
              </Block>
            )}

            {/* 7. Inclusions / Exclusions */}
            <Block title="What’s Included">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="card p-5">
                  <h3 className="mb-3 font-bold text-green-600">✅ Inclusions</h3>
                  <ul className="space-y-2">{trip.inclusions.map((x) => <li key={x} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><Check size={16} className="mt-0.5 shrink-0 text-green-500" aria-hidden="true" />{x}</li>)}</ul>
                </div>
                <div className="card p-5">
                  <h3 className="mb-3 font-bold text-red-500">❌ Exclusions</h3>
                  <ul className="space-y-2">{trip.exclusions.map((x) => <li key={x} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><XCircle size={16} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />{x}</li>)}</ul>
                </div>
              </div>
            </Block>

            {/* 8. Stay & Transport */}
            {(trip.stay.length > 0 || trip.transport) && (
              <Block title="Stay & Transport">
                <div className="card divide-y divide-slate-100 dark:divide-slate-700">
                  {trip.stay.map((s) => (
                    <div key={s.place} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                      <span className="flex items-center gap-3"><BedDouble size={18} className="text-sky-brand" aria-hidden="true" /><span><strong className="block text-slate-900 dark:text-white">{s.place}</strong><span className="text-slate-500">{s.type}</span></span></span>
                      <Badge tone="sky" className="shrink-0 whitespace-nowrap">{s.nights} {s.nights === 1 ? 'night' : 'nights'}</Badge>
                    </div>
                  ))}
                  {trip.transport && (
                    <div className="flex items-center gap-3 px-5 py-4 text-sm"><Bus size={18} className="text-sky-brand" aria-hidden="true" /><span><strong className="block text-slate-900 dark:text-white">Transport</strong><span className="text-slate-500">{trip.transport}</span></span></div>
                  )}
                </div>
              </Block>
            )}

            {/* 9. Important info tabs */}
            <Block title="Important Info"><InfoTabs trip={trip} /></Block>

            {/* 10. Cancellation */}
            <div id="cancellation" className="scroll-mt-24">
            <Accordion title={<><ShieldCheck size={18} className="mr-2 text-sky-brand" aria-hidden="true" />Cancellation Policy</>}>
              <table className="w-full text-sm">
                <tbody>
                  {CANCELLATION_POLICY.map((c) => (
                    <tr key={c.window} className="border-b border-slate-100 last:border-0 dark:border-slate-700">
                      <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{c.window}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">{c.refund}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Accordion>
            </div>

            {/* 11. Reviews */}
            <Block title="Traveller Reviews">
              <RatingSummary rating={trip.rating} count={trip.reviews} />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {reviewsToShow.map((r) => <ReviewCard key={r.id} r={r} />)}
              </div>
            </Block>

            {/* 12. FAQ */}
            <Block title="Frequently Asked Questions">
              <div className="space-y-3">
                {trip.faqs.map((q) => <Accordion key={q.q} title={q.q}><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{q.a}</p></Accordion>)}
              </div>
            </Block>
          </div>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24"><BookingCard id="d" {...booking} /></div>
          </aside>
        </div>

        {/* 13. Similar trips */}
        {fallbackSimilar.length > 0 && (
          <Reveal className="mt-16">
            <h2 className="mb-5 border-l-4 border-sky-brand pl-4 text-2xl font-bold text-deep dark:text-white">You May Also Like</h2>
            <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:px-0">
              {fallbackSimilar.map((t) => <div key={t.id} className="w-[80%] shrink-0 snap-start md:w-auto"><PosterTripCard trip={t} /></div>)}
            </div>
          </Reveal>
        )}
      </div>

      {/* Mobile sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white lg:hidden dark:border-slate-700 dark:bg-slate-900">
        <a href={waLink(enquiry)} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp(`Trip page bar · ${trip.name}`)} className="flex flex-1 items-center justify-center gap-1.5 bg-green-500 py-4 text-sm font-bold text-white">
          <WhatsAppIcon size={16} /> WhatsApp
        </a>
        <a href={`tel:+${settings.whatsapp}`} className="flex flex-1 items-center justify-center gap-1.5 border-x border-slate-200 bg-sky-light py-4 text-sm font-bold text-sky-dark dark:border-slate-700">
          <Phone size={16} aria-hidden="true" /> Call
        </a>
        <button type="button" onClick={scrollToBook} className="flex-1 bg-sky-brand py-4 text-center text-sm font-bold text-white">Book Now</button>
      </div>

      <Lightbox images={gallery} index={lightbox} setIndex={setLightbox} title={trip.name} />
    </>
  )
}

function Block({ title, children }) {
  return (
    <Reveal as="section" y={24}>
      <h2 className="mb-4 border-l-4 border-sky-brand pl-4 text-2xl font-bold text-deep dark:text-white">{title}</h2>
      {children}
    </Reveal>
  )
}

function Accordion({ as: Tag = 'div', title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Tag className="card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-slate-900 hover:bg-sky-xlight dark:text-white dark:hover:bg-slate-700/40">
        <span className="flex items-center">{title}</span>
        <ChevronDown size={18} className={`shrink-0 text-sky-brand transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-700">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Tag>
  )
}

function InfoTabs({ trip }) {
  const tabs = [
    { id: 'carry', label: 'Things to Carry', body: <ul className="grid gap-2 sm:grid-cols-2">{trip.thingsToCarry.map((x) => <li key={x} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-sky-brand" aria-hidden="true" />{x}</li>)}</ul> },
    { id: 'weather', label: 'Weather', body: <p className="text-sm leading-relaxed">{trip.weather || 'Weather varies by season — we share a detailed forecast 3 days before departure.'}</p> },
    { id: 'pickup', label: 'Pickup', body: <p className="text-sm leading-relaxed">{trip.pickup || `Pickup from ${trip.startingPoint}. Exact point shared on WhatsApp after booking.`}</p> },
  ]
  const [active, setActive] = useState(tabs[0].id)
  return (
    <div className="card p-5">
      <div role="tablist" aria-label="Important info" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={active === t.id} onClick={() => setActive(t.id)} className={`rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${active === t.id ? 'bg-sky-brand text-white' : 'bg-sky-light text-sky-dark hover:bg-sky-brand/20 dark:bg-slate-700 dark:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="text-slate-600 dark:text-slate-300">
          {tabs.find((t) => t.id === active).body}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function RatingSummary({ rating, count }) {
  // Approximate distribution from the average; real per-star counts would come from a reviews API.
  const five = Math.round(Math.max(0, Math.min(1, rating - 3.9)) * 90)
  const dist = [five, Math.round((100 - five) * 0.75), Math.round((100 - five) * 0.2), 1, 0]
  return (
    <div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
      <div className="text-center sm:w-40">
        <div className="text-5xl font-black text-deep dark:text-white">{rating}</div>
        <Stars rating={rating} size={18} className="mt-1" />
        <div className="mt-1 text-xs text-slate-500">{count} verified reviews</div>
      </div>
      <div className="flex-1 space-y-1.5">
        {dist.map((p, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span className="flex w-8 items-center gap-0.5 font-semibold">{5 - i}<Star size={11} className="fill-yellow-400 text-yellow-400" aria-hidden="true" /></span>
            <div className="h-2 flex-1 overflow-hidden rounded-pill bg-slate-100 dark:bg-slate-700">
              <motion.div className="h-full rounded-pill bg-sky-brand" initial={{ width: 0 }} whileInView={{ width: `${p}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.08 }} />
            </div>
            <span className="w-9 text-right text-slate-500">{p}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BookingCard({ id, trip, dates, date, setDate, people, setPeople, sharing, setSharing }) {
  const { waLink, trackWhatsApp } = useData()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState(false)
  const selected = dates.find((d) => d.date === date)
  const maxPeople = selected?.seats || 20
  // Keep the traveller count within the seats left when a group departure is picked.
  useEffect(() => { if (people > maxPeople) setPeople(maxPeople) }, [people, maxPeople, setPeople])
  const options = sharingPrices(trip)
  const chosen = options.find((o) => o.id === sharing && o.price) || options.find((o) => o.price)
  const unit = chosen?.price || trip.price
  const total = unit * people
  const url = `${SITE_URL}/trips/${trip.slug}` // always share the live URL

  const book = () => {
    if (!date) { setError('Please pick a start date on the calendar'); return }
    setError('')
    setCheckout(true)
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }
  const share = () => navigator.share?.({ title: trip.name, url }).catch(() => {})

  return (
    <div data-book id={`book-${id}`} className="space-y-4 rounded-2xl bg-white p-6 shadow-hover dark:bg-slate-800 dark:ring-1 dark:ring-slate-700">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Starting from</p>
        <div className="text-3xl font-black text-sky-brand">{inr(fromPrice(trip))} <span className="text-base font-normal text-slate-400">/person</span></div>
      </div>

      <div>
        <p id={`date-label-${id}`} className="label">Choose your start date</p>
        <DateCalendar id={`date-${id}`} value={date} onChange={(d) => { setDate(d); setError('') }} departures={dates} />
        {date ? (
          <p className="mt-2 rounded-lg bg-sky-xlight px-3 py-2 text-sm dark:bg-slate-900" aria-live="polite">
            <span className="font-bold text-deep dark:text-white">Selected: {fmtDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="block text-xs text-slate-500">{selected ? `Group departure · ${selected.seats} seats left` : 'Your own start date — we’ll confirm availability on WhatsApp'}</span>
          </p>
        ) : null}
        {error && <p id={`err-${id}`} role="alert" className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
      </div>

      <fieldset>
        <legend className="label">Room sharing</legend>
        <div className="grid grid-cols-2 gap-2">
          {options.map((o) => {
            const on = chosen?.id === o.id
            if (!o.price) {
              return (
                <a key={o.id} href={waLink(`Hi! I'd like ${o.label.toLowerCase()} for ${trip.name}${date ? ` on ${fmtDate(date)}` : ''}. What's the price?`)} target="_blank" rel="noopener noreferrer"
                  className="rounded-xl border border-dashed border-slate-300 p-2.5 text-left transition-colors hover:border-green-500 dark:border-slate-600">
                  <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{o.short}</span>
                  <span className="block text-[11px] text-slate-400">{o.note}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs font-bold text-green-600"><WhatsAppIcon size={11} /> On request</span>
                </a>
              )
            }
            return (
              <button key={o.id} type="button" aria-pressed={on} onClick={() => setSharing(o.id)}
                className={`rounded-xl border-2 p-2.5 text-left transition-colors ${on ? 'border-sky-brand bg-sky-xlight dark:bg-sky-500/10' : 'border-slate-200 hover:border-sky-brand dark:border-slate-600'}`}>
                <span className="block text-sm font-semibold text-slate-800 dark:text-white">{o.short}</span>
                <span className="block text-[11px] text-slate-400">{o.note}</span>
                <span className="mt-1 block text-sm font-black text-sky-brand">{inr(o.price)}<span className="text-[10px] font-normal text-slate-400">/person</span></span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div>
        <span id={`ppl-${id}`} className="label">No. of people</span>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-1.5 dark:border-slate-700" role="group" aria-labelledby={`ppl-${id}`}>
          <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Decrease travellers" className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-light text-sky-dark hover:bg-sky-brand hover:text-white dark:bg-slate-700 dark:text-white"><Minus size={16} /></button>
          <span className="text-lg font-bold" aria-live="polite">{people}</span>
          <button type="button" onClick={() => setPeople((p) => Math.min(maxPeople, p + 1))} aria-label="Increase travellers" className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-light text-sky-dark hover:bg-sky-brand hover:text-white dark:bg-slate-700 dark:text-white"><Plus size={16} /></button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-sky-xlight px-4 py-3 text-sm dark:bg-slate-900">
        <span className="text-slate-500">{inr(unit)} × {people} · {chosen?.short}</span>
        <span className="text-lg font-black text-deep dark:text-white">{inr(total)}</span>
      </div>

      <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={book} className="w-full rounded-pill bg-sky-brand py-3 font-bold text-white transition-colors hover:bg-sky-dark">
        Book Now
      </motion.button>
      <a href={waLink(`Hi, I'm interested in ${trip.name}`)} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp(`Trip enquiry · ${trip.name}`)} className="flex w-full items-center justify-center gap-2 rounded-pill bg-green-500 py-3 font-bold text-white transition-colors hover:bg-green-600">
        <WhatsAppIcon size={18} /> Enquire on WhatsApp
      </a>
      {trip.brochure && (
        <a href={driveView(trip.brochure)} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-pill border-2 border-sky-brand py-2.5 text-sm font-bold text-sky-dark hover:bg-sky-light dark:text-sky-300 dark:hover:bg-slate-700">
          <Download size={16} aria-hidden="true" /> Itinerary PDF
        </a>
      )}
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500"><Calendar size={12} aria-hidden="true" />Pay just {ADVANCE_PERCENT}% now to reserve · secured by PayU</p>

      <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-700">
        <span>Share:</span>
        <button type="button" onClick={copy} aria-label="Copy trip link" className="rounded-full p-2 hover:bg-sky-light hover:text-sky-dark dark:hover:bg-slate-700">{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(`${trip.name} — ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="rounded-full p-2 hover:bg-sky-light hover:text-green-600 dark:hover:bg-slate-700"><WhatsAppIcon size={16} /></a>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button type="button" onClick={share} aria-label="Share trip" className="rounded-full p-2 hover:bg-sky-light hover:text-sky-dark dark:hover:bg-slate-700"><Share2 size={16} /></button>
        )}
        {copied && <span role="status" className="text-xs font-semibold text-green-600">Link copied!</span>}
      </div>
      {date && chosen && <CheckoutModal open={checkout} onClose={() => setCheckout(false)} trip={trip} date={date} people={people} sharing={chosen} />}
    </div>
  )
}

function Lightbox({ images, index, setIndex, title }) {
  const open = index !== null
  const close = useCallback(() => setIndex(null), [setIndex])
  const ref = useFocusTrap(open, close)
  const go = useCallback((dir) => setIndex((i) => (i + dir + images.length) % images.length), [images.length, setIndex])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${title} photo gallery`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 focus:outline-none">
          <button type="button" onClick={close} aria-label="Close gallery" className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"><X size={22} /></button>
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:left-6"><ChevronLeft size={26} /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:right-6"><ChevronRight size={26} /></button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={index}
              src={images[index]}
              alt={`${title} — photo ${index + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1) }}
              className="max-h-[85vh] max-w-[92vw] cursor-grab rounded-xl object-contain active:cursor-grabbing"
            />
          </AnimatePresence>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-pill bg-white/10 px-4 py-1.5 text-sm text-white" aria-live="polite">{index + 1} / {images.length}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
