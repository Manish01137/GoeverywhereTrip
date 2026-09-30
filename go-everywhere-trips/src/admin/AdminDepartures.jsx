import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { Field } from '../pages/Contact'
import { useData } from '../context/DataContext'
import { fmtDate, seatTone } from '../lib/format'
import { EmptyRow, IconBtn, Panel, Table, Td } from './ui'

export default function AdminDepartures() {
  const { tripRecords, setTrips } = useData()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [form, setForm] = useState({ tripId: '', date: '', seats: 16 })
  const [error, setError] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (params.get('new')) { setOpen(true); setParams({}, { replace: true }) }
  }, [params, setParams])

  const rows = useMemo(
    () => tripRecords
      .flatMap((t) => (t.departures || []).map((d) => ({ ...d, trip: t })))
      .filter((d) => showPast || d.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [tripRecords, showPast, today],
  )

  const updateDeps = (tripId, fn) =>
    setTrips((all) => all.map((t) => {
      if (t.id !== tripId) return t
      const departures = fn(t.departures || []).sort((a, b) => a.date.localeCompare(b.date))
      const next = departures.find((d) => d.date >= today)
      return { ...t, departures, nextDeparture: next?.date, seats: next?.seats ?? t.seats }
    }))

  const add = (e) => {
    e.preventDefault()
    const tripId = Number(form.tripId)
    if (!tripId || !form.date) return setError('Pick a trip and a date')
    const trip = tripRecords.find((t) => t.id === tripId)
    if (trip.departures?.some((d) => d.date === form.date)) return setError('That trip already departs on this date')
    updateDeps(tripId, (deps) => [...deps, { date: form.date, seats: Number(form.seats) || 0 }])
    setForm({ tripId: '', date: '', seats: 16 })
    setError('')
    setOpen(false)
  }

  return (
    <>
      <Panel
        action={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} className="accent-sky-brand" /> Show past departures
            </label>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-pill bg-sky-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark"><Plus size={16} /> Add Departure</button>
          </div>
        }
      >
        <Table head={['Date', 'Trip', 'Seats left', '']} empty={!rows.length && <EmptyRow text="No departures scheduled." />}>
          {rows.map((d) => (
            <tr key={d.trip.id + d.date} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${d.date < today ? 'opacity-50' : ''}`}>
              <Td className="whitespace-nowrap font-semibold">{fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</Td>
              <Td>{d.trip.name}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <label htmlFor={`s-${d.trip.id}-${d.date}`} className="sr-only">Seats left for {d.trip.name} on {d.date}</label>
                  <input
                    id={`s-${d.trip.id}-${d.date}`}
                    type="number"
                    min={0}
                    value={d.seats}
                    onChange={(e) => updateDeps(d.trip.id, (deps) => deps.map((x) => (x.date === d.date ? { ...x, seats: Math.max(0, Number(e.target.value)) } : x)))}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                  />
                  <span className={`rounded-pill px-2 py-0.5 text-xs font-bold ${seatTone(d.seats)}`}>{d.seats === 0 ? 'Sold out' : d.seats <= 5 ? 'Low' : 'Open'}</span>
                </div>
              </Td>
              <Td className="text-right">
                <IconBtn label="Delete departure" tone="red" onClick={() => window.confirm('Delete this departure?') && updateDeps(d.trip.id, (deps) => deps.filter((x) => x.date !== d.date))}><Trash2 size={16} /></IconBtn>
              </Td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Departure"
        footer={<div className="flex justify-end"><button type="submit" form="dep-form" className="rounded-pill bg-sky-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-dark">Add Departure</button></div>}>
        <form id="dep-form" onSubmit={add} className="space-y-4">
          <Field id="d-trip" label="Trip"><select id="d-trip" value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })} className="input"><option value="">Select a trip</option>{tripRecords.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
          <Field id="d-date" label="Departure date"><input id="d-date" type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></Field>
          <Field id="d-seats" label="Seats available"><input id="d-seats" type="number" min={0} value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className="input" /></Field>
          {error && <p role="alert" className="text-sm font-semibold text-red-500">{error}</p>}
        </form>
      </Modal>
    </>
  )
}
