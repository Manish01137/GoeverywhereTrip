import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import TabToggle from '../ui/TabToggle'
import PosterTripCard from '../ui/PosterTripCard'
import { Arrows, Dots, ITEM_4, Track, useCarousel } from '../ui/Carousel'
import { Reveal } from '../ui/Reveal'
import { useData } from '../../context/DataContext'

// Title left, tab toggle centre, arrows right — then a poster-card carousel.
// `tabs` is [{ label, filter(trip) }]; `sort` orders the trips; `ribbon` labels every card.
export default function TripTabsCarousel({ id, title, tabs, sort, ribbon, markNew, viewAll = '/trips' }) {
  const { publicTrips } = useData()
  const [tab, setTab] = useState(tabs[0].label)
  const list = useMemo(() => {
    const t = tabs.find((x) => x.label === tab)
    const out = publicTrips.filter(t.filter)
    return sort ? [...out].sort(sort) : out
  }, [publicTrips, tab, tabs, sort])
  const c = useCarousel(tab)

  return (
    <section className="container-x py-12">
      <Reveal y={24} className="mb-6 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">{title}</h2>
        <TabToggle id={id} tabs={tabs.map((t) => t.label)} value={tab} onChange={setTab} className="justify-self-start lg:justify-self-center" />
        <Arrows c={c} label={title} className="hidden justify-self-end lg:flex" />
      </Reveal>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          {list.length ? (
            <Track c={c}>
              {list.map((t) => (
                <div key={t.id} className={ITEM_4}>
                  <PosterTripCard trip={t} ribbon={ribbon} isNew={markNew?.(t)} />
                </div>
              ))}
            </Track>
          ) : (
            <p className="rounded-2xl bg-white py-12 text-center text-slate-500 dark:bg-slate-800">New {tab.toLowerCase()} trips launching soon — <Link to="/custom-trip" className="font-semibold text-sky-brand">plan a custom one</Link>.</p>
          )}
        </motion.div>
      </AnimatePresence>

      <Dots c={c} className="mt-4" />
      <div className="mt-6 text-center">
        <Link to={viewAll} className="inline-flex items-center gap-2 rounded-pill bg-sky-brand px-6 py-2.5 font-semibold text-white shadow-lg shadow-sky-brand/30 transition-colors hover:bg-sky-dark">
          View All <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
