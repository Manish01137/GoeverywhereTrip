import { Link } from 'react-router-dom'
import { BadgeCheck, CalendarDays, Clock, MapPin } from 'lucide-react'
import Img from './Img'
import { inr, upcoming } from '../../lib/format'

const MONTH = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })

export const nightsDays = (days) => (days > 1 ? `${days - 1}N/${days}D` : '1D')

export function monthRange(trip) {
  const deps = upcoming(trip.departures)
  if (!deps.length) return 'On request'
  const first = MONTH(deps[0].date)
  const last = MONTH(deps[deps.length - 1].date)
  return first === last ? first : `${first} - ${last}`
}

// Full-bleed photo card with details overlaid at the bottom (JustWravel-style).
export default function PosterTripCard({ trip, ribbon, isNew = false, className = '' }) {
  const off = trip.originalPrice > trip.price ? trip.originalPrice - trip.price : 0
  const seats = upcoming(trip.departures)[0]?.seats
  return (
    <Link
      to={`/trips/${trip.slug}`}
      className={`group relative block h-[360px] overflow-hidden rounded-2xl bg-deep shadow-card transition-shadow hover:shadow-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-brand/50 ${className}`}
    >
      <Img src={trip.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/90" aria-hidden="true" />

      {ribbon && (
        <span className="absolute left-1/2 top-0 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-b-lg bg-white px-3 py-1 text-xs font-bold text-sky-dark shadow">
          <BadgeCheck size={14} className="fill-sky-brand text-white" aria-hidden="true" /> {ribbon}
        </span>
      )}
      {isNew && (
        <span className="absolute -left-9 top-4 z-10 w-32 -rotate-45 bg-accent py-1 text-center text-[11px] font-black uppercase tracking-wider text-white shadow">New</span>
      )}
      {seats !== undefined && seats <= 5 && (
        <span className={`absolute right-3 z-10 rounded-pill bg-accent px-2.5 py-1 text-[11px] font-bold text-white shadow ${ribbon ? 'top-10' : 'top-3'}`}>Only {seats} seats left</span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
        <h3 className="line-clamp-2 text-lg font-medium leading-snug">{trip.name}</h3>
        <span className="mt-2 inline-flex max-w-full items-center gap-1 truncate rounded-pill border border-white/80 px-2.5 py-0.5 text-xs">
          <MapPin size={12} className="shrink-0" aria-hidden="true" />
          {trip.startingPoint} to {trip.startingPoint}
        </span>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/40 pt-2.5 text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            <Clock size={14} className="shrink-0" aria-hidden="true" />{nightsDays(trip.durationDays)}
            <span className="text-white/60">|</span>
            <CalendarDays size={14} className="shrink-0" aria-hidden="true" /><span className="truncate">{monthRange(trip)}</span>
          </span>
          {off > 0 && (
            <span className="flex shrink-0 overflow-hidden rounded-md text-center font-black leading-none shadow">
              <span className="flex items-center bg-lime-400 px-1.5 text-[10px] text-slate-900">Upto</span>
              <span className="bg-sky-brand px-1.5 py-1 text-xs">{inr(off)}<span className="block text-[8px]">OFF</span></span>
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-2">
            {off > 0 && <s className="text-xs text-white/70">{inr(trip.originalPrice)}</s>}
            <span className="text-lg font-bold">{inr(trip.price)}</span>
          </span>
          <span className="flex items-center gap-1 text-xs">
            <span className="text-yellow-400" aria-hidden="true">★★★★★</span>
            <span className="text-white/80">({trip.reviews})</span>
            <span className="sr-only">Rated {trip.rating} from {trip.reviews} reviews</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
