import { Quote } from 'lucide-react'
import Stars from './Stars'

export default function ReviewCard({ r, className = '' }) {
  return (
    <figure className={`card relative flex flex-col border-l-4 border-sky-brand p-6 ${className}`}>
      <Quote className="absolute right-5 top-5 text-sky-light dark:text-slate-700" size={36} aria-hidden="true" />
      <Stars rating={r.rating} size={16} />
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">“{r.review}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-brand text-sm font-bold text-white" aria-hidden="true">{r.avatar}</span>
        <span>
          <span className="block font-bold text-slate-900 dark:text-white">{r.name}</span>
          <span className="block text-xs text-slate-400">{r.trip}</span>
        </span>
      </figcaption>
    </figure>
  )
}
