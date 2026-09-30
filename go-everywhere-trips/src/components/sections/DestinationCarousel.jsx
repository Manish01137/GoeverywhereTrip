import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Img from '../ui/Img'
import { Arrows, Dots, ITEM_4, Track, useCarousel } from '../ui/Carousel'
import { Reveal } from '../ui/Reveal'
import { destinations } from '../../data/destinations'
import { useData } from '../../context/DataContext'
import { inr } from '../../lib/format'

export default function DestinationCarousel() {
  const { publicTrips } = useData()

  // Cheapest trip that matches each destination (by state or by place name).
  const withPrice = useMemo(() => destinations.map((d) => {
    const key = d.name.replace(' Valley', '').toLowerCase()
    const matches = publicTrips.filter((t) => [t.destination, ...t.places].some((p) => p.toLowerCase().startsWith(key)))
    return { ...d, from: matches.length ? Math.min(...matches.map((t) => t.price)) : null }
  }), [publicTrips])
  const c = useCarousel()

  return (
    <section id="destinations" className="container-x py-12">
      <Reveal y={24} className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">Explore Destinations</h2>
        <Arrows c={c} label="destinations" className="hidden lg:flex" />
      </Reveal>
          <Track c={c}>
            {withPrice.map((d) => (
              <Link key={d.name} to={d.link} className={`${ITEM_4} group block`}>
                <div className="relative h-[340px] overflow-hidden rounded-2xl shadow-card">
                  <Img src={d.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" aria-hidden="true" />
                  <span className="absolute left-2 top-2 rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-800">{d.tripCount}+ Trips</span>
                  <div className="absolute inset-x-0 top-10 px-4 text-center">
                    <h3 className="font-serif text-4xl font-bold italic text-white drop-shadow-lg">{d.name}</h3>
                    <p className="mt-1 text-xs font-medium text-white/95 drop-shadow">{d.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 pt-3 text-lg font-bold text-slate-900 dark:text-white">
                  <span>{d.from ? 'Starting Price' : 'Custom Trips'}</span>
                  <span className={d.from ? '' : 'text-base text-sky-brand'}>{d.from ? inr(d.from) : 'Enquire →'}</span>
                </div>
              </Link>
            ))}
          </Track>
      <Dots c={c} className="mt-4" />
    </section>
  )
}
