import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Img from '../components/ui/Img'
import { Field } from '../pages/Contact'
import { useData } from '../context/DataContext'
import { TRIP_TYPES } from '../data/trips'
import { inr, slugify } from '../lib/format'
import { EmptyRow, IconBtn, Panel, StatusBadge, Table, Td } from './ui'

const BLANK = { name: '', type: 'Trek', destination: '', duration: '', durationDays: 3, price: '', originalPrice: '', startingPoint: 'Dehradun', seats: 20, description: '', image: '', highlights: '', status: 'Active', groupType: 'Group' }

export default function AdminTrips() {
  const { tripRecords, setTrips } = useData()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | trip id
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})

  const openNew = () => { setForm(BLANK); setErrors({}); setEditing('new') }
  const openEdit = (t) => { setForm({ ...BLANK, ...t, highlights: (t.highlights || []).join(', ') }); setErrors({}); setEditing(t.id) }
  const close = () => setEditing(null)

  // Dashboard "Add Trip" deep-links here with ?new=1
  useEffect(() => {
    if (params.get('new')) { openNew(); setParams({}, { replace: true }) }
  }, [params, setParams])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return tripRecords.filter((t) => !s || `${t.name} ${t.destination} ${t.type}`.toLowerCase().includes(s))
  }, [tripRecords, q])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })) }

  const save = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim()) er.name = 'Required'
    if (!form.destination.trim()) er.destination = 'Required'
    if (!(Number(form.price) > 0)) er.price = 'Enter a price'
    if (!form.duration.trim()) er.duration = 'Required'
    setErrors(er)
    if (Object.keys(er).length) return

    const record = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) > Number(form.price) ? Number(form.originalPrice) : undefined,
      seats: Number(form.seats) || 0,
      durationDays: Number(form.durationDays) || 1,
      highlights: form.highlights.split(',').map((h) => h.trim()).filter(Boolean),
      image: form.image.trim() || 'heroAlt',
    }

    setTrips((all) => {
      if (editing === 'new') {
        let slug = slugify(record.name)
        while (all.some((t) => t.slug === slug)) slug += '-2'
        const id = Math.max(0, ...all.map((t) => t.id)) + 1
        return [...all, { rating: 5, reviews: 0, departures: [], gallery: [record.image], ...record, id, slug }]
      }
      return all.map((t) => (t.id === editing ? { ...t, ...record, gallery: t.gallery?.length ? t.gallery : [record.image] } : t))
    })
    close()
  }

  const remove = (t) => {
    if (window.confirm(`Delete “${t.name}”? This cannot be undone.`)) setTrips((all) => all.filter((x) => x.id !== t.id))
  }

  return (
    <>
      <Panel
        action={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="trip-q" className="sr-only">Search trips</label>
              <input id="trip-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trips…" className="input py-2 pl-9" />
            </div>
            <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-pill bg-sky-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark"><Plus size={16} /> Add Trip</button>
          </div>
        }
      >
        <Table head={['Trip', 'Category', 'Price', 'Status', 'Actions']} empty={!list.length && <EmptyRow text="No trips match your search." />}>
          {list.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <Td>
                <div className="flex items-center gap-3">
                  <Img src={t.image} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.destination} · {t.duration}</p>
                  </div>
                </div>
              </Td>
              <Td className="text-slate-600 dark:text-slate-300">{t.type}</Td>
              <Td className="font-semibold">{inr(t.price)}</Td>
              <Td><StatusBadge status={t.status || 'Active'} /></Td>
              <Td>
                <div className="flex gap-1">
                  <IconBtn label={`Edit ${t.name}`} onClick={() => openEdit(t)}><Pencil size={16} /></IconBtn>
                  <IconBtn label={`Delete ${t.name}`} tone="red" onClick={() => remove(t)}><Trash2 size={16} /></IconBtn>
                  {t.status !== 'Draft' && <IconBtn label={`View ${t.name} on site`} href={`/trips/${t.slug}`}><Eye size={16} /></IconBtn>}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Modal
        open={editing !== null}
        onClose={close}
        title={editing === 'new' ? 'Add Trip' : 'Edit Trip'}
        variant="drawer"
        wide
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={close} className="rounded-pill border border-slate-200 px-5 py-2.5 text-sm font-semibold dark:border-slate-700">Cancel</button>
            <button type="submit" form="trip-form" className="rounded-pill bg-sky-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-dark">Save Trip</button>
          </div>
        }
      >
        <form id="trip-form" onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field id="t-name" label="Name *" error={errors.name}><input id="t-name" value={form.name} onChange={set('name')} className="input" /></Field></div>
          <Field id="t-type" label="Category"><select id="t-type" value={form.type} onChange={set('type')} className="input">{TRIP_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field id="t-dest" label="Destination *" error={errors.destination}><input id="t-dest" value={form.destination} onChange={set('destination')} className="input" placeholder="Uttarakhand" /></Field>
          <Field id="t-dur" label="Duration *" error={errors.duration}><input id="t-dur" value={form.duration} onChange={set('duration')} className="input" placeholder="5 Days 4 Nights" /></Field>
          <Field id="t-days" label="Duration (days, for filters)"><input id="t-days" type="number" min={1} value={form.durationDays} onChange={set('durationDays')} className="input" /></Field>
          <Field id="t-price" label="Price (₹ per person) *" error={errors.price}><input id="t-price" type="number" min={0} value={form.price} onChange={set('price')} className="input" /></Field>
          <Field id="t-mrp" label="Original price (optional, shows 'Upto ₹X OFF')"><input id="t-mrp" type="number" min={0} value={form.originalPrice ?? ''} onChange={set('originalPrice')} className="input" /></Field>
          <Field id="t-start" label="Starting point"><input id="t-start" value={form.startingPoint} onChange={set('startingPoint')} className="input" /></Field>
          <Field id="t-seats" label="Max seats"><input id="t-seats" type="number" min={0} value={form.seats} onChange={set('seats')} className="input" /></Field>
          <Field id="t-group" label="Group / Private"><select id="t-group" value={form.groupType} onChange={set('groupType')} className="input"><option>Group</option><option>Private</option></select></Field>
          <div className="sm:col-span-2"><Field id="t-desc" label="Description"><textarea id="t-desc" rows={3} value={form.description} onChange={set('description')} className="input resize-none" /></Field></div>
          <div className="sm:col-span-2">
            <Field id="t-img" label="Image URL"><input id="t-img" value={form.image} onChange={set('image')} className="input" placeholder="https://images.unsplash.com/…" /></Field>
            {form.image && <Img src={form.image} alt="Preview" className="mt-2 h-32 w-full rounded-xl object-cover" />}
          </div>
          <div className="sm:col-span-2"><Field id="t-hl" label="Highlights (comma-separated)"><input id="t-hl" value={form.highlights} onChange={set('highlights')} className="input" placeholder="Summit sunrise, Campfire, Village walk" /></Field></div>
          <Field id="t-status" label="Status"><select id="t-status" value={form.status} onChange={set('status')} className="input"><option>Active</option><option>Draft</option></select></Field>
        </form>
      </Modal>
    </>
  )
}
