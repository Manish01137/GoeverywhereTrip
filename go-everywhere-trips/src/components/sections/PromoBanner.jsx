import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Img from '../ui/Img'

// Single "Customise Your Trip" banner (no slider).
export default function PromoBanner() {
  return (
    <section className="container-x py-8" aria-label="Customise your trip">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <Link to="/custom-trip" className="group relative block h-[240px] overflow-hidden rounded-2xl bg-deep md:h-[250px]">
          <Img src="customTrips" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-dark/95 via-deep/70 to-transparent" aria-hidden="true" />
          <div className="relative flex h-full flex-col justify-center px-5 md:px-14">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.15em] text-sky-300 md:text-sm md:tracking-[0.2em]">Your dates · your group · your budget</p>
            <h2 className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-white drop-shadow md:text-6xl">
              Customise <span className="text-sun">Your Trip</span>
            </h2>
            <p className="mt-2 line-clamp-2 max-w-xl text-sm font-semibold text-white/90 md:text-lg">
              Tell us your plan — get a handcrafted itinerary on WhatsApp in 24 hours.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 self-start rounded-md bg-sun px-5 py-2.5 text-sm font-black text-slate-900 shadow-lg transition-transform group-hover:scale-105 md:absolute md:bottom-6 md:right-6 md:mt-0">
              PLAN MY TRIP <ArrowRight size={16} aria-hidden="true" />
            </span>
          </div>
        </Link>
      </motion.div>
    </section>
  )
}
