import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Inline month calendar for picking a trip start date.
// - Group departures (from the trip's dates) are highlighted with seats left; full ones are blocked.
// - Any other future date can be picked as the traveller's own start date.
// Dates are "YYYY-MM-DD" strings in local time.

const MONTHS_AHEAD = 18
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }

export const calendarBounds = () => {
  const t = new Date()
  const min = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1) // from tomorrow
  const max = new Date(t.getFullYear(), t.getMonth() + MONTHS_AHEAD + 1, 0)
  return { min: iso(min), max: iso(max) }
}

export default function DateCalendar({ id, value, onChange, departures = [] }) {
  const { min, max } = calendarBounds()
  const byDate = useMemo(() => Object.fromEntries(departures.map((d) => [d.date, d])), [departures])
  const startMonth = () => {
    const s = parse(value || departures.find((d) => d.seats > 0 && d.date >= min)?.date || min)
    return new Date(s.getFullYear(), s.getMonth(), 1)
  }
  const [month, setMonth] = useState(startMonth)

  // Jump to the chosen date's month when it's picked elsewhere (e.g. the "Book" buttons in the dates table).
  useEffect(() => {
    if (!value) return
    const v = parse(value)
    setMonth((m) => (m.getFullYear() === v.getFullYear() && m.getMonth() === v.getMonth() ? m : new Date(v.getFullYear(), v.getMonth(), 1)))
  }, [value])

  const first = parse(min)
  const last = parse(max)
  const canPrev = month > new Date(first.getFullYear(), first.getMonth(), 1)
  const canNext = month < new Date(last.getFullYear(), last.getMonth(), 1)
  const shift = (n) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))

  const cells = useMemo(() => {
    const lead = (month.getDay() + 6) % 7 // Monday-first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => iso(new Date(month.getFullYear(), month.getMonth(), i + 1)))]
  }, [month])

  const monthDepartures = departures.filter((d) => d.date.startsWith(iso(month).slice(0, 7)) && d.date >= min)
  const label = month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700" id={id}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-sky-light disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"><ChevronLeft size={18} /></button>
        <p className="text-sm font-bold text-deep dark:text-white" aria-live="polite">{label}</p>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-sky-light disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-slate-400" aria-hidden="true">
        {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label={`Choose a start date, ${label}`}>
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />
          const dep = byDate[d]
          const full = dep && dep.seats === 0
          const disabled = d < min || d > max || full
          const selected = d === value
          const day = Number(d.slice(8))
          const text = `${parse(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}${dep ? (full ? ', group departure full' : `, group departure, ${dep.seats} seats left`) : ''}`
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              aria-label={text}
              aria-pressed={selected}
              title={dep ? (full ? 'Group departure — full' : `Group departure · ${dep.seats} seats left`) : undefined}
              className={`relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-sm transition-colors
                ${selected ? 'bg-sky-brand font-bold text-white shadow-md shadow-sky-brand/40' : ''}
                ${!selected && dep && !full ? 'bg-green-100 font-bold text-green-800 ring-1 ring-green-400 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-200' : ''}
                ${!selected && !dep && !disabled ? 'text-slate-700 hover:bg-sky-light dark:text-slate-200 dark:hover:bg-slate-700' : ''}
                ${disabled ? 'cursor-not-allowed text-slate-300 line-through decoration-slate-300 dark:text-slate-600' : ''}`}
            >
              {day}
              {dep && !full && <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${selected ? 'bg-white' : 'bg-green-600'}`} aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <p className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-green-100 ring-1 ring-green-400" aria-hidden="true" /> Group departure (join the batch)</p>
        <p className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-slate-300" aria-hidden="true" /> Any other date — your own start date</p>
        {monthDepartures.length > 0 && (
          <p className="pt-1 font-semibold text-green-700 dark:text-green-300">
            This month: {monthDepartures.map((d) => `${Number(d.date.slice(8))}${d.seats === 0 ? ' (full)' : ''}`).join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
