import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Width classes for carousel items: 1.2 per view on phones, 2 on tablets, 4 on desktop (gap-5).
export const ITEM_4 = 'snap-start shrink-0 w-[80%] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]'
export const ITEM_3 = 'snap-start shrink-0 w-[88%] md:w-[calc(50%-10px)] lg:w-[calc(33.333%-13.34px)]'

// Scroll-snap carousel state: page dots + prev/next that move one viewport at a time.
export function useCarousel(resetKey) {
  const ref = useRef(null)
  const [s, setS] = useState({ page: 0, pages: 1, atStart: true, atEnd: true })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05))
    setS({
      pages,
      page: Math.min(pages - 1, Math.round(el.scrollLeft / el.clientWidth)),
      atStart: el.scrollLeft < 4,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ left: 0 })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [update, resetKey])

  const by = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth, behavior: 'smooth' })
  const goTo = (p) => ref.current?.scrollTo({ left: p * ref.current.clientWidth, behavior: 'smooth' })
  return { ref, ...s, prev: () => by(-1), next: () => by(1), goTo }
}

export function Track({ c, className = '', children }) {
  return (
    <div ref={c.ref} className={`no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-3 pt-3 sm:mx-0 sm:scroll-px-0 sm:px-0 ${className}`}>
      {children}
    </div>
  )
}

export function Arrows({ c, label = 'items', className = '' }) {
  const btn = 'flex h-10 w-10 items-center justify-center rounded-full bg-sky-brand text-white shadow-lg shadow-sky-brand/30 transition hover:bg-sky-dark disabled:bg-sky-brand/40 disabled:shadow-none'
  return (
    <div className={`flex gap-3 ${className}`}>
      <button type="button" onClick={c.prev} disabled={c.atStart} aria-label={`Previous ${label}`} className={btn}><ChevronLeft size={18} /></button>
      <button type="button" onClick={c.next} disabled={c.atEnd} aria-label={`Next ${label}`} className={btn}><ChevronRight size={18} /></button>
    </div>
  )
}

export function Dots({ c, className = '' }) {
  if (c.pages < 2) return null
  return (
    <div className={`flex justify-center gap-1.5 ${className}`}>
      {Array.from({ length: c.pages }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => c.goTo(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={c.page === i}
          className={`h-1.5 rounded-pill transition-all ${c.page === i ? 'w-6 bg-sky-brand' : 'w-1.5 bg-sky-brand/30 hover:bg-sky-brand/60'}`}
        />
      ))}
    </div>
  )
}
