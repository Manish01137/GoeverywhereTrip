import { Star } from 'lucide-react'

export default function Stars({ rating = 5, size = 14, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'} aria-hidden="true" />
      ))}
    </span>
  )
}
