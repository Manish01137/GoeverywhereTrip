import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TabToggle from '../ui/TabToggle'
import PosterTripCard from '../ui/PosterTripCard'
import { Arrows, Dots, ITEM_4, Track, useCarousel } from '../ui/Carousel'
import { Reveal } from '../ui/Reveal'
import { useData } from '../../context/DataContext'
import { monthKey, upcoming } from '../../lib/format'

function nextMonths(n) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-IN', { month: 'short' }) }
  })
}

export default function UpcomingTrips() {
  const { publicTrips } = useData()
  const [group, setGroup] = useState('Group Trips')
  const [month, setMonth] = useState('all')
  const months = useMemo(() => nextMonths(8).filter((m) => publicTrips.some((t) => upcoming(t.departures).some((d) => monthKey(d.date) === m.key))), [publicTrips])

  const list = useMemo(() =>
    publicTrips
      .filter((t) => (group === 'Group Trips' ? t.groupType === 'Group' : t.groupType === 'Private'))
      .map((t) => ({ t, deps: upcoming(t.departures).filter((d) => month === 'all' || monthKey(d.date) === month) }))
      .filter((x) => x.deps.length)
      .sort((a, b) => a.deps[0].date.localeCompare(b.deps[0].date))
      .map((x) => x.t),
  [publicTrips, group, month])
  const c = useCarousel(group + month)

  const pill = (on) => `shrink-0 rounded-pill border px-5 py-2 text-sm font-medium transition-colors ${on ? 'border-sky-brand bg-sky-brand text-white shadow-md shadow-sky-brand/30' : 'border-slate-300 text-slate-700 hover:border-sky-brand hover:text-sky-dark dark:border-slate-600 dark:text-slate-200'}`

  return (
    <section className="container-x py-12">
      <Reveal y={24} className="mb-6 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">Upcoming Trips</h2>
        <TabToggle id="upcoming" tabs={['Group Trips', 'Private Trips']} value={group} onChange={setGroup} className="justify-self-start lg:justify-self-center" />
        <Arrows c={c} label="upcoming trips" className="hidden justify-self-end lg:flex" />
      </Reveal>

      <div role="group" aria-label="Filter by month" className="no-scrollbar -mx-4 mb-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:justify-center sm:px-0">
        <button type="button" aria-pressed={month === 'all'} onClick={() => setMonth('all')} className={pill(month === 'all')}>All Months</button>
        {months.map((m) => <button key={m.key} type="button" aria-pressed={month === m.key} onClick={() => setMonth(m.key)} className={pill(month === m.key)}>{m.label}</button>)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={group + month} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
          {list.length ? (
            <Track c={c}>
              {list.map((t) => <div key={t.id} className={ITEM_4}><PosterTripCard trip={t} /></div>)}
            </Track>
          ) : (
            <p className="rounded-2xl bg-white py-12 text-center text-slate-500 dark:bg-slate-800">No departures for this selection yet.</p>
          )}
        </motion.div>
      </AnimatePresence>
      <Dots c={c} className="mt-4" />
    </section>
  )
}
