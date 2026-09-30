import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPin, MessageSquareHeart, Mountain, Search, BriefcaseBusiness, Users } from 'lucide-react'
import Img from '../ui/Img'
import Stars from '../ui/Stars'
import CountStat from '../ui/CountStat'
import { IMAGES } from '../../data/images'
import { destinations } from '../../data/destinations'
import { useData } from '../../context/DataContext'

// Destination word + photo pill cycle together in the headline.
const ROTATE = [
  { word: 'Uttarakhand', image: 'chopta' },
  { word: 'Himachal', image: 'manali' },
  { word: 'Kedarnath', image: 'kedarnath' },
  { word: 'Spiti', image: 'spiti' },
  { word: 'Rajasthan', image: 'rajasthan' },
]

const swap = { initial: { y: '60%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '-60%', opacity: 0 }, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }

export default function Hero() {
  const { settings, publicTrips, publicReviews } = useData()
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ROTATE.length), 2600)
    return () => clearInterval(t)
  }, [])

  const totalReviews = publicTrips.reduce((s, t) => s + (t.reviews || 0), 0)
  const stats = [
    { Icon: MessageSquareHeart, end: totalReviews, suffix: '+', label: 'Reviews' },
    { Icon: Users, end: 500, suffix: '+', label: 'Happy Travellers' },
    { Icon: Mountain, end: 50, suffix: '+', label: 'Destinations' },
    { Icon: BriefcaseBusiness, end: 5, suffix: ' Years+', label: 'Experience' },
  ]

  return (
    <section
      className="relative overflow-hidden bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(3,15,24,0.88) 0%, rgba(3,15,24,0.55) 55%, rgba(3,15,24,0.7) 100%), url(${IMAGES.heroMain})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container-x grid gap-10 pb-8 pt-14 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Left: headline, tagline, search */}
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.85 } } }}>
          <motion.h1 variants={fade} className="text-[2.4rem] font-extrabold leading-[1.2] text-white sm:text-6xl lg:text-[3.4rem] xl:text-[3.8rem]">
            <span className="flex flex-wrap items-center gap-x-4">
              {settings.heroTitle1}
              <span className="relative inline-block h-[0.95em] w-[1.9em] overflow-hidden rounded-pill ring-2 ring-white/30" aria-hidden="true">
                <AnimatePresence initial={false}>
                  <motion.span key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                    <Img src={ROTATE[i].image} alt="" eager className="h-full w-full object-cover" />
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
            <span className="flex flex-wrap items-baseline gap-x-4">
              {settings.heroTitle2}
              <span className="relative inline-grid overflow-hidden pb-[0.12em] text-sky-brand">
                {/* Invisible longest word reserves width so the line doesn't jump */}
                <span className="invisible col-start-1 row-start-1">Uttarakhand</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={ROTATE[i].word} {...swap} className="col-start-1 row-start-1">{ROTATE[i].word}</motion.span>
                </AnimatePresence>
              </span>
            </span>
            <span className="sr-only">— Uttarakhand, Himachal, Kedarnath, Spiti and Rajasthan</span>
          </motion.h1>

          <motion.p variants={fade} className="mt-7 text-xl font-semibold text-white md:text-2xl">
            <span className="text-sky-brand">Explore</span> | Trek | <span className="text-sky-brand">Connect</span> | Repeat
          </motion.p>
          <motion.p variants={fade} className="mt-1 font-medium text-white">{settings.heroSubtitle}</motion.p>
          <motion.p variants={fade} className="text-sm text-white/70">#goeverywheretrips</motion.p>

          <motion.div variants={fade} className="relative mt-6 flex items-center gap-6">
            <HeroSearch trips={publicTrips} />
            {/* Hand-drawn arrow pointing at the search */}
            <motion.svg viewBox="0 0 120 90" className="hidden h-20 w-28 shrink-0 text-sky-brand sm:block" fill="none" aria-hidden="true" initial="a" animate="b">
              <motion.path d="M110 10 C 95 40, 70 55, 55 40 C 45 30, 60 12, 72 25 C 85 40, 60 72, 12 70" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                variants={{ a: { pathLength: 0 }, b: { pathLength: 1, transition: { duration: 1.2, delay: 1.6 } } }} />
              <motion.path d="M24 58 L10 70 L26 80" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                variants={{ a: { opacity: 0 }, b: { opacity: 1, transition: { delay: 2.7 } } }} />
            </motion.svg>
          </motion.div>
        </motion.div>

        {/* Right: auto-scrolling review cards */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1, duration: 0.7 }} className="hidden lg:block">
          <ReviewMarquee reviews={publicReviews} />
        </motion.div>
      </div>

      {/* Stats row */}
      <div className="container-x pb-10 pt-4">
        <div className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:divide-x md:divide-white/30">
          {stats.map(({ Icon, ...s }) => (
            <div key={s.label} className="flex items-center gap-3 md:justify-center md:first:justify-start md:last:justify-end">
              <Icon size={36} strokeWidth={1.6} className="shrink-0 text-white" aria-hidden="true" />
              <CountStat {...s} valueClass="text-2xl font-bold text-white md:text-3xl" labelClass="text-sm text-white/85 md:text-base" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } } }

function HeroSearch({ trips }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const box = useRef(null)

  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase()
    const dest = destinations.map((d) => ({ label: d.name, sub: `${d.tripCount} trips`, to: d.link }))
    const tr = trips.map((t) => ({ label: t.name, sub: `${t.destination} · ${t.duration}`, to: `/trips/${t.slug}` }))
    const all = [...dest, ...tr]
    return (s ? all.filter((x) => x.label.toLowerCase().includes(s) || x.sub.toLowerCase().includes(s)) : dest).slice(0, 6)
  }, [q, trips])

  useEffect(() => {
    const close = (e) => !box.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (active >= 0 && suggestions[active]) return navigate(suggestions[active].to)
    navigate(q.trim() ? `/trips?search=${encodeURIComponent(q.trim())}` : '/trips')
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(suggestions.length - 1, a + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <form ref={box} onSubmit={submit} role="search" className="relative w-full max-w-sm">
      <label htmlFor="hero-search" className="sr-only">Search destinations or trips</label>
      <div className="flex items-center rounded-pill bg-white p-1.5 pl-6 shadow-xl ring-4 ring-white/20">
        <input
          id="hero-search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Type Location..."
          autoComplete="off"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="hero-suggestions"
          aria-activedescendant={active >= 0 ? `sug-${active}` : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none"
        />
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-pill bg-sky-brand px-5 py-2.5 font-semibold text-white transition-colors hover:bg-sky-dark">
          <Search size={16} className="sm:hidden" aria-hidden="true" /><span className="hidden sm:inline">Search</span><span className="sr-only sm:hidden">Search</span>
        </button>
      </div>
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            id="hero-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white py-2 shadow-2xl dark:bg-slate-800"
          >
            {suggestions.map((s, n) => (
              <li key={s.to} id={`sug-${n}`} role="option" aria-selected={active === n}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => navigate(s.to)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${active === n ? 'bg-sky-light dark:bg-slate-700' : 'hover:bg-sky-xlight dark:hover:bg-slate-700'}`}>
                  <MapPin size={16} className="shrink-0 text-sky-brand" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{s.label}</span>
                    <span className="block truncate text-xs text-slate-500">{s.sub}</span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </form>
  )
}

function ReviewMarquee({ reviews }) {
  const list = reviews.slice(0, 6)
  if (!list.length) return null
  return (
    <div className="group relative h-[430px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]" aria-label="Traveller reviews">
      <div className="animate-marquee-y space-y-6 group-hover:[animation-play-state:paused]">
        {[...list, ...list].map((r, n) => (
          <figure key={n} aria-hidden={n >= list.length} className="flex gap-4 rounded-xl border border-white/25 bg-white/10 p-5 text-white backdrop-blur-md">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-brand text-sm font-bold ring-2 ring-white/50">{r.avatar}</span>
            <div className="min-w-0">
              <Stars rating={r.rating} size={16} />
              <blockquote className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-white/95">{r.review}</blockquote>
              <figcaption className="mt-2 text-xs text-white/70">— {r.name}, {r.trip}</figcaption>
            </div>
          </figure>
        ))}
      </div>
    </div>
  )
}
