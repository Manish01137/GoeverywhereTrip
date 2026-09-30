import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Quote } from 'lucide-react'
import Img from '../ui/Img'
import Stars from '../ui/Stars'
import Eyebrow from '../ui/Eyebrow'
import { GoogleIcon } from '../ui/BrandIcons'
import { Arrows, ITEM_3, Track, useCarousel } from '../ui/Carousel'
import { useData } from '../../context/DataContext'

export default function GoogleReviews() {
  const { publicReviews, publicTrips } = useData()
  const c = useCarousel()
  return (
    <section className="container-x py-14">
      <Eyebrow eyebrow="Reviews" title="Loved by Our Travellers" />
      <Track c={c}>
        {publicReviews.map((r) => <ReviewCard key={r.id} r={r} trip={publicTrips.find((t) => t.name === r.trip)} />)}
      </Track>
      <Arrows c={c} label="reviews" className="mt-6 justify-center" />
    </section>
  )
}

function ReviewCard({ r, trip }) {
  const [more, setMore] = useState(false)
  return (
    <figure className={`${ITEM_3} relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800`}>
      <Quote className="absolute right-6 top-10 h-16 w-16 fill-slate-100 text-slate-100 dark:fill-slate-700 dark:text-slate-700" aria-hidden="true" />
      <figcaption className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-brand to-deep text-sm font-bold text-white" aria-hidden="true">{r.avatar}</span>
        <span>
          <span className="block font-semibold text-slate-900 dark:text-white">{r.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5"><GoogleIcon size={15} /><Stars rating={r.rating} size={14} /></span>
        </span>
      </figcaption>
      <blockquote className={`relative mt-5 text-justify text-[15px] leading-7 text-slate-700 dark:text-slate-300 ${more ? '' : 'line-clamp-5'}`}>“{r.review}”</blockquote>
      {r.review.length > 220 && (
        <button type="button" onClick={() => setMore((m) => !m)} className="mt-1 self-end text-sm font-semibold text-sky-brand hover:underline">{more ? 'Read less' : 'Read more'}</button>
      )}
      <div className="mt-auto pt-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-sky-xlight p-2 dark:border-slate-700 dark:bg-slate-900">
          <Img src={trip?.image || 'heroAlt'} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{r.trip}</p>
            {trip && (
              <Link to={`/trips/${trip.slug}`} className="mt-1.5 inline-flex items-center gap-1.5 rounded-pill bg-sky-light px-3 py-1.5 text-sm font-medium text-sky-dark transition-colors hover:bg-sky-brand hover:text-white dark:bg-sky-500/15 dark:text-sky-300">
                Try Yourself <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </figure>
  )
}
