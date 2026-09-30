import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, MapPin, Users, ArrowRight } from 'lucide-react'
import Img from './Img'
import Stars from './Stars'
import { WhatsAppIcon } from './BrandIcons'
import { useData } from '../../context/DataContext'
import { fmtDate, inr, upcoming } from '../../lib/format'

export default function TripCard({ trip, className = '', compact = false }) {
  const { waLink, trackWhatsApp } = useData()
  const next = upcoming(trip.departures)[0]
  const seats = next?.seats ?? trip.seats
  const nextDate = next?.date ?? trip.nextDeparture

  return (
    <motion.article
      whileHover={{ y: -6, boxShadow: '0 8px 40px rgba(14,165,233,0.22)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative rounded-card overflow-hidden shadow-card bg-white group flex flex-col dark:bg-slate-800 dark:ring-1 dark:ring-slate-700 ${className}`}
    >
      <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
        <Img src={trip.image} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute top-3 left-3 bg-sky-brand text-white text-xs font-semibold px-3 py-1 rounded-pill">{trip.type}</span>
        {seats <= 5 && (
          <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-pill animate-pulse">
            Only {seats} seats left!
          </span>
        )}
        {trip.badge && (
          <span className="absolute bottom-3 left-3 bg-white/90 text-deep text-xs font-bold px-2.5 py-1 rounded-pill">{trip.badge}</span>
        )}
      </div>

      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 leading-tight dark:text-white">
          {/* Stretched link makes the whole card clickable while keeping the WhatsApp button separate. */}
          <Link to={`/trips/${trip.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {trip.name}
          </Link>
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><MapPin size={14} aria-hidden="true" />{trip.destination}</span>
          <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden="true" />{trip.duration}</span>
          {!compact && <span className="inline-flex items-center gap-1"><Users size={14} aria-hidden="true" />{trip.groupType}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Stars rating={trip.rating} />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{trip.rating}</span>
          <span className="text-slate-400">({trip.reviews} reviews)</span>
        </div>

        <div className="flex items-end justify-between pt-2 mt-auto gap-2">
          <div>
            <div className="text-xl font-bold text-sky-brand">
              {inr(trip.price)}
              <span className="text-sm font-normal text-slate-400">/person</span>
            </div>
            {nextDate && <div className="text-xs text-slate-400">Next: {fmtDate(nextDate)}</div>}
          </div>
          <div className="relative z-10 flex flex-col gap-1.5">
            <a
              href={waLink(`Hi, I'm interested in ${trip.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp(`Trip card · ${trip.name}`)}
              className="inline-flex items-center justify-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-pill font-medium hover:bg-green-600 transition-colors"
            >
              <WhatsAppIcon size={12} /> WhatsApp
            </a>
            <Link
              to={`/trips/${trip.slug}`}
              tabIndex={-1}
              className="inline-flex items-center justify-center gap-1 text-xs bg-sky-brand text-white px-3 py-1.5 rounded-pill font-medium hover:bg-sky-dark transition-colors"
            >
              View Details <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
