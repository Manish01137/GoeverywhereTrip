import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Img from '../ui/Img'

const SLIDES = [
  { eyebrow: '4 to 6 days · Snow season', title: 'Winter Treks', accent: '2026', sub: 'Chopta · Tungnath · Harshil · Kedarkantha', image: 'blog1', to: '/trips?type=Trek', cta: 'BOOK NOW' },
  { eyebrow: 'Last batches before the temple closes', title: 'Kedarnath', accent: 'Yatra', sub: 'Registration, stays & pony/heli help included', image: 'kedarnath', to: '/trips/kedarnath-yatra-from-dehradun', cta: 'BOOK NOW' },
  { eyebrow: 'Friday night to Sunday bliss', title: 'Weekend Escapes', accent: 'from ₹3,499', sub: 'Rafting · Beach camping · Ganga aarti', image: 'weekend', to: '/trips?type=Weekend', cta: 'VIEW ALL TRIPS' },
]

export default function PromoBanner() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [paused])
  const s = SLIDES[i]

  return (
    <section className="container-x py-8" aria-roledescription="carousel" aria-label="Offers" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[200px] overflow-hidden rounded-2xl bg-deep md:h-[240px]">
        <AnimatePresence initial={false}>
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            <Link to={s.to} className="group block h-full" aria-label={`${s.title} ${s.accent} — ${s.cta.toLowerCase()}`}>
              <Img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-deep-dark/90 via-deep/60 to-transparent" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-center px-6 md:px-14">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300 md:text-sm">{s.eyebrow}</p>
                <p className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-white drop-shadow md:text-6xl">
                  {s.title} <span className="text-yellow-300">{s.accent}</span>
                </p>
                <p className="mt-2 text-sm font-semibold text-white/90 md:text-lg">{s.sub}</p>
              </div>
              <span className="absolute bottom-4 right-4 rounded-md bg-yellow-300 px-4 py-2 text-sm font-black text-slate-900 shadow-lg transition-transform group-hover:scale-105 md:bottom-6 md:right-6">{s.cta}</span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {SLIDES.map((_, n) => (
          <button key={n} type="button" onClick={() => setI(n)} aria-label={`Show offer ${n + 1}`} aria-current={i === n}
            className={`h-1.5 rounded-pill transition-all ${i === n ? 'w-6 bg-sky-brand' : 'w-1.5 bg-sky-brand/30'}`} />
        ))}
      </div>
    </section>
  )
}
