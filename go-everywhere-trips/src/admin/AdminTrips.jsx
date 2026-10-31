import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowDown, ArrowUp, Copy, Eye, FileText, HelpCircle, ImageOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Img from '../components/ui/Img'
import { Field } from '../pages/Contact'
import { useData } from '../context/DataContext'
import { TRIP_TYPES, withDefaults } from '../data/trips'
import { IMAGES, driveId, img, isDriveFolder } from '../data/images'
import { inr, slugify } from '../lib/format'
import { SHARING, sharingPrices } from '../lib/sharing'
import { EmptyRow, IconBtn, Panel, StatusBadge, Table, Td } from './ui'

const SECTIONS = ['Basics', 'Photos & PDF', 'Itinerary', 'Inclusions & stay', 'FAQs', 'Dates']
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean)
const join = (a) => (a || []).join('\n')

const BLANK = {
  name: '', slug: '', type: 'Trek', destination: '', places: '', duration: '', durationDays: 3, groupType: 'Group',
  startingPoint: 'Dehradun', price: '', originalPrice: '', sharing: { quad: '', triple: '', double: '', single: '' }, seats: 20, badge: '', status: 'Draft', rating: 5, reviews: 0,
  description: '', highlights: '',
  image: '', gallery: '', brochure: '', video: '',
  itinerary: [{ title: '', desc: '', activities: '' }],
  inclusions: '', exclusions: '', thingsToCarry: '', stay: [], transport: '', weather: '', pickup: '',
  faqs: [], departures: [],
}

// Built-in photos are stored as short keys (e.g. "harshil") — show their real links instead.
const asLink = (v) => IMAGES[v] || v

// Convert a stored trip into editable form fields (lists → one item per line).
function toForm(raw) {
  const t = withDefaults(raw)
  return {
    ...BLANK, ...raw,
    image: asLink(raw.image || ''),
    places: (raw.places || []).join(', '),
    highlights: join(raw.highlights),
    gallery: join((raw.gallery || []).filter((g) => g !== raw.image).map(asLink)),
    itinerary: (raw.itinerary || []).map((d) => ({ title: d.title || '', desc: d.desc || '', activities: join(d.activities) })),
    inclusions: join(t.inclusions), exclusions: join(t.exclusions), thingsToCarry: join(t.thingsToCarry),
    stay: (raw.stay || []).map((s) => ({ ...s })),
    faqs: (raw.faqs || []).map((f) => ({ ...f })),
    departures: (raw.departures || []).map((d) => ({ ...d })),
    originalPrice: raw.originalPrice ?? '',
    // Current per-person prices (empty = on request), starting from the same defaults the website uses.
    sharing: Object.fromEntries(sharingPrices(raw).map((o) => [o.id, o.price ?? ''])),
    badge: raw.badge || '', brochure: raw.brochure || '', video: raw.video || '',
    transport: raw.transport || '', weather: raw.weather || '', pickup: raw.pickup || '',
  }
}

const linkProblem = (url) => {
  if (!url) return null
  if (isDriveFolder(url)) return 'That’s a Drive folder link — open the file itself and copy its link.'
  if (/drive\.google\.com|docs\.google\.com/.test(url) && !driveId(url)) return 'Couldn’t read this Drive link — use Share → Copy link on the file.'
  return null
}

export default function AdminTrips() {
  const { tripRecords, setTrips } = useData()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | trip id
  const [form, setForm] = useState(BLANK)
  const [section, setSection] = useState(SECTIONS[0])
  const [errors, setErrors] = useState({})

  const open = (raw, copy = false) => {
    setErrors({})
    setSection(SECTIONS[0])
    if (!raw) { setForm(BLANK); setEditing('new'); return }
    const f = toForm(raw)
    if (copy) { setForm({ ...f, name: `${f.name} (copy)`, slug: '', status: 'Draft' }); setEditing('new'); return }
    setForm(f)
    setEditing(raw.id)
  }
  const close = () => setEditing(null)

  // Dashboard "Add Trip" deep-links here with ?new=1
  useEffect(() => {
    if (params.get('new')) { open(null); setParams({}, { replace: true }) }
  }, [params, setParams])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return tripRecords.filter((t) => !s || `${t.name} ${t.destination} ${t.type}`.toLowerCase().includes(s))
  }, [tripRecords, q])

  const set = (k) => (e) => { const v = e?.target ? e.target.value : e; setForm((f) => ({ ...f, [k]: v })); setErrors((er) => ({ ...er, [k]: undefined })) }

  const save = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim()) er.name = 'Required'
    if (!form.destination.trim()) er.destination = 'Required'
    if (!form.duration.trim()) er.duration = 'Required'
    const sharingSet = Object.values(form.sharing || {}).map(Number).filter((n) => n > 0)
    if (!(Number(form.price) > 0) && !sharingSet.length) er.price = 'Enter a price (or room sharing prices below)'
    if (!form.image.trim()) er.image = 'Add a cover photo link'
    const imgErr = linkProblem(form.image); if (imgErr) er.image = imgErr
    const galErr = lines(form.gallery).map(linkProblem).find(Boolean); if (galErr) er.gallery = galErr
    const pdfErr = linkProblem(form.brochure); if (pdfErr) er.brochure = pdfErr
    const dates = form.departures.map((d) => d.date).filter(Boolean)
    if (new Set(dates).size !== dates.length) er.departures = 'Two departures have the same date'
    let slug = editing === 'new' ? slugify(form.slug || form.name) : form.slug
    if (editing === 'new') {
      if (!slug) er.slug = 'Add a name first'
      while (tripRecords.some((t) => t.slug === slug)) slug += '-2'
    }
    setErrors(er)
    if (Object.keys(er).length) {
      const where = { name: 0, destination: 0, duration: 0, price: 0, slug: 0, image: 1, gallery: 1, brochure: 1, departures: 5 }
      setSection(SECTIONS[Math.min(...Object.keys(er).map((k) => where[k] ?? 0))])
      return
    }

    const cover = form.image.trim()
    const record = {
      name: form.name.trim(), slug, type: form.type, destination: form.destination.trim(),
      places: form.places.split(',').map((p) => p.trim()).filter(Boolean),
      duration: form.duration.trim(), durationDays: Math.max(1, Number(form.durationDays) || 1), groupType: form.groupType,
      startingPoint: form.startingPoint.trim(),
      // "Starting from" price on cards = cheapest room-sharing price when set.
      price: sharingSet.length ? Math.min(...sharingSet) : Number(form.price),
      sharing: Object.fromEntries(SHARING.map((o) => [o.id, Number(form.sharing?.[o.id]) > 0 ? Number(form.sharing[o.id]) : null])),
      originalPrice: Number(form.originalPrice) > Number(form.price) ? Number(form.originalPrice) : undefined,
      seats: Number(form.seats) || 0, badge: form.badge.trim() || undefined, status: form.status,
      rating: Math.min(5, Math.max(0, Number(form.rating) || 0)), reviews: Math.max(0, Number(form.reviews) || 0),
      description: form.description.trim(), highlights: lines(form.highlights),
      image: cover, gallery: [cover, ...lines(form.gallery)],
      brochure: form.brochure.trim() || undefined, video: form.video.trim() || undefined,
      itinerary: form.itinerary.filter((d) => d.title.trim() || d.desc.trim()).map((d) => ({ title: d.title.trim(), desc: d.desc.trim(), activities: lines(d.activities) })),
      inclusions: lines(form.inclusions), exclusions: lines(form.exclusions), thingsToCarry: lines(form.thingsToCarry),
      stay: form.stay.filter((s) => s.place?.trim()).map((s) => ({ place: s.place.trim(), type: (s.type || '').trim(), nights: Number(s.nights) || 1 })),
      transport: form.transport.trim(), weather: form.weather.trim(), pickup: form.pickup.trim(),
      faqs: form.faqs.filter((f) => f.q?.trim() && f.a?.trim()).map((f) => ({ q: f.q.trim(), a: f.a.trim() })),
      departures: form.departures.filter((d) => d.date).map((d) => ({ date: d.date, seats: Math.max(0, Number(d.seats) || 0) })).sort((a, b) => a.date.localeCompare(b.date)),
    }
    // Empty lists fall back to the standard copy on the website.
    ;['inclusions', 'exclusions', 'thingsToCarry'].forEach((k) => { if (!record[k].length) delete record[k] })
    record.nextDeparture = record.departures[0]?.date

    setTrips((all) => {
      if (editing === 'new') return [...all, { ...record, id: Math.max(0, ...all.map((t) => Number(t.id) || 0)) + 1 }]
      return all.map((t) => (t.id === editing ? { ...t, ...record } : t))
    })
    close()
  }

  const remove = (t) => {
    if (window.confirm(`Delete “${t.name}”? It will disappear from the website. (You can bring it back from Settings → Version history.)`)) setTrips((all) => all.filter((x) => x.id !== t.id))
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
            <button type="button" onClick={() => open(null)} className="inline-flex items-center gap-2 rounded-pill bg-sky-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark"><Plus size={16} /> Add Trip</button>
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
                    <p className="text-xs text-slate-500">{t.destination} · {t.duration}{t.brochure && ' · 📄 PDF'}</p>
                  </div>
                </div>
              </Td>
              <Td className="text-slate-600 dark:text-slate-300">{t.type}</Td>
              <Td className="font-semibold">{inr(t.price)}</Td>
              <Td><StatusBadge status={t.status || 'Active'} /></Td>
              <Td>
                <div className="flex gap-1">
                  <IconBtn label={`Edit ${t.name}`} onClick={() => open(t)}><Pencil size={16} /></IconBtn>
                  <IconBtn label={`Duplicate ${t.name}`} onClick={() => open(t, true)}><Copy size={16} /></IconBtn>
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
        title={editing === 'new' ? 'Add Trip' : `Edit: ${form.name}`}
        variant="drawer"
        wide
        footer={
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <span className="hidden sm:inline">Status</span>
              <select value={form.status} onChange={set('status')} className="rounded-pill border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" aria-label="Status">
                <option value="Active">Live on website</option>
                <option value="Draft">Draft (hidden)</option>
              </select>
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={close} className="rounded-pill border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700 sm:px-5">Cancel</button>
              <button type="submit" form="trip-form" className="whitespace-nowrap rounded-pill bg-sky-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark sm:px-6">Save</button>
            </div>
          </div>
        }
      >
        <div role="tablist" aria-label="Trip sections" className="no-scrollbar -mx-6 -mt-5 mb-5 flex gap-1 overflow-x-auto border-b border-slate-100 px-6 pt-1 dark:border-slate-800">
          {SECTIONS.map((s) => {
            const hasError = { Basics: ['name', 'destination', 'duration', 'price', 'slug'], 'Photos & PDF': ['image', 'gallery', 'brochure'], Dates: ['departures'] }[s]?.some((k) => errors[k])
            return (
              <button key={s} type="button" role="tab" aria-selected={section === s} onClick={() => setSection(s)}
                className={`relative shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold ${section === s ? 'border-sky-brand text-sky-dark dark:text-sky-300' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                {s}{hasError && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-red-500" aria-label="has errors" />}
              </button>
            )
          })}
        </div>

        <form id="trip-form" onSubmit={save} noValidate>
          {section === 'Basics' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field id="t-name" label="Trip name *" error={errors.name}><input id="t-name" value={form.name} onChange={set('name')} className="input" placeholder="Kedarkantha Winter Trek" /></Field></div>
              <div className="sm:col-span-2">
                {editing === 'new' ? (
                  <Field id="t-slug" label="Page address (optional)" error={errors.slug}>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 pl-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                      /trips/<input id="t-slug" value={form.slug} onChange={set('slug')} placeholder={slugify(form.name) || 'auto-from-name'} className="min-w-0 flex-1 bg-transparent px-1 py-3 text-slate-900 focus:outline-none dark:text-white" />
                    </div>
                  </Field>
                ) : <p className="text-xs text-slate-500">Page: <a href={`/trips/${form.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-brand">/trips/{form.slug}</a> (kept the same so Google links don’t break)</p>}
              </div>
              <Field id="t-type" label="Category"><select id="t-type" value={form.type} onChange={set('type')} className="input">{TRIP_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field id="t-group" label="Group / Private"><select id="t-group" value={form.groupType} onChange={set('groupType')} className="input"><option>Group</option><option>Private</option></select></Field>
              <Field id="t-dest" label="Destination (state/region) *" error={errors.destination}><input id="t-dest" value={form.destination} onChange={set('destination')} className="input" placeholder="Uttarakhand" /></Field>
              <Field id="t-places" label="Places covered (comma-separated)"><input id="t-places" value={form.places} onChange={set('places')} className="input" placeholder="Sankri, Kedarkantha, Juda ka Talab" /></Field>
              <Field id="t-dur" label="Duration (as shown) *" error={errors.duration}><input id="t-dur" value={form.duration} onChange={set('duration')} className="input" placeholder="6 Days 5 Nights" /></Field>
              <Field id="t-days" label="Number of days"><input id="t-days" type="number" min={1} value={form.durationDays} onChange={set('durationDays')} className="input" /></Field>
              <Field id="t-start" label="Starting point"><input id="t-start" value={form.startingPoint} onChange={set('startingPoint')} className="input" /></Field>
              <Field id="t-badge" label="Badge on card (optional)"><input id="t-badge" value={form.badge} onChange={set('badge')} className="input" placeholder="Bestseller / New / Winter Special" /></Field>
              <Field id="t-price" label="Price per person (₹) *" error={errors.price}><input id="t-price" type="number" min={0} value={form.price} onChange={set('price')} className="input" /></Field>
              <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="label">Room sharing prices (₹ per person)</p>
                <p className="-mt-1 mb-3 text-xs text-slate-500">Customers choose one when booking. Leave a box empty to show it as “On request” (they’ll WhatsApp you). The lowest price becomes the “Starting from” price.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SHARING.map((o) => (
                    <Field key={o.id} id={`t-sh-${o.id}`} label={o.short}>
                      <input id={`t-sh-${o.id}`} type="number" min={0} inputMode="numeric" placeholder="On request" value={form.sharing?.[o.id] ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, sharing: { ...f.sharing, [o.id]: e.target.value } }))} className="input" />
                    </Field>
                  ))}
                </div>
              </div>
              <Field id="t-mrp" label="Original price (₹, optional — shows a discount)"><input id="t-mrp" type="number" min={0} value={form.originalPrice} onChange={set('originalPrice')} className="input" /></Field>
              <Field id="t-rating" label="Rating (0–5)"><input id="t-rating" type="number" min={0} max={5} step={0.1} value={form.rating} onChange={set('rating')} className="input" /></Field>
              <Field id="t-reviews" label="Number of reviews"><input id="t-reviews" type="number" min={0} value={form.reviews} onChange={set('reviews')} className="input" /></Field>
              <div className="sm:col-span-2"><Field id="t-desc" label="Short description"><textarea id="t-desc" rows={3} value={form.description} onChange={set('description')} className="input resize-y" /></Field></div>
              <div className="sm:col-span-2"><Field id="t-hl" label="Highlights (one per line)"><textarea id="t-hl" rows={4} value={form.highlights} onChange={set('highlights')} className="input resize-y" placeholder={'Summit sunrise\nCampfire night\nVillage walk'} /></Field></div>
            </div>
          )}

          {section === 'Photos & PDF' && (
            <div className="space-y-5">
              <DriveHelp />
              <div>
                <Field id="t-img" label="Cover photo * (Google Drive or image link)" error={errors.image}>
                  <input id="t-img" value={form.image} onChange={set('image')} className="input" placeholder="https://drive.google.com/file/d/…/view?usp=sharing" />
                </Field>
                {form.image && !linkProblem(form.image) && <Preview url={form.image} className="mt-2 h-44 w-full" />}
              </div>
              <div>
                <Field id="t-gal" label="Gallery photos (one link per line)" error={errors.gallery}>
                  <textarea id="t-gal" rows={5} value={form.gallery} onChange={set('gallery')} className="input resize-y font-mono text-xs" placeholder={'https://drive.google.com/file/d/…/view\nhttps://drive.google.com/file/d/…/view'} />
                </Field>
                {lines(form.gallery).length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {lines(form.gallery).map((u, i) => (linkProblem(u) ? <div key={i} className="flex h-20 items-center justify-center rounded-lg bg-red-50 p-2 text-center text-[11px] text-red-600">Line {i + 1}: bad link</div> : <Preview key={i} url={u} className="h-20 w-full" />))}
                  </div>
                )}
              </div>
              <div>
                <Field id="t-pdf" label="Itinerary / brochure PDF (Google Drive link)" error={errors.brochure}>
                  <input id="t-pdf" value={form.brochure} onChange={set('brochure')} className="input" placeholder="https://drive.google.com/file/d/…/view" />
                </Field>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><FileText size={13} /> Shows a “Download itinerary (PDF)” button on the trip page.</p>
              </div>
              <Field id="t-video" label="Video (YouTube link, optional)"><input id="t-video" value={form.video} onChange={set('video')} className="input" placeholder="https://www.youtube.com/watch?v=…" /></Field>
            </div>
          )}

          {section === 'Itinerary' && (
            <div className="space-y-4">
              {form.itinerary.map((d, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-pill bg-sky-brand px-3 py-1 text-xs font-bold text-white">Day {i + 1}</span>
                    <div className="flex gap-1">
                      <IconBtn label="Move up" onClick={() => i > 0 && set('itinerary')(move(form.itinerary, i, -1))}><ArrowUp size={15} /></IconBtn>
                      <IconBtn label="Move down" onClick={() => i < form.itinerary.length - 1 && set('itinerary')(move(form.itinerary, i, 1))}><ArrowDown size={15} /></IconBtn>
                      <IconBtn label={`Remove day ${i + 1}`} tone="red" onClick={() => set('itinerary')(form.itinerary.filter((_, j) => j !== i))}><Trash2 size={15} /></IconBtn>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input aria-label={`Day ${i + 1} title`} value={d.title} onChange={(e) => set('itinerary')(edit(form.itinerary, i, { title: e.target.value }))} className="input" placeholder="Dehradun → Sankri" />
                    <textarea aria-label={`Day ${i + 1} description`} rows={2} value={d.desc} onChange={(e) => set('itinerary')(edit(form.itinerary, i, { desc: e.target.value }))} className="input resize-y" placeholder="What happens on this day" />
                    <textarea aria-label={`Day ${i + 1} activities`} rows={3} value={d.activities} onChange={(e) => set('itinerary')(edit(form.itinerary, i, { activities: e.target.value }))} className="input resize-y" placeholder={'Activities, one per line\nCampfire\nSunset point'} />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => set('itinerary')([...form.itinerary, { title: '', desc: '', activities: '' }])}>Add day</AddButton>
            </div>
          )}

          {section === 'Inclusions & stay' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="t-inc" label="Inclusions (one per line)"><textarea id="t-inc" rows={7} value={form.inclusions} onChange={set('inclusions')} className="input resize-y" /></Field>
              <Field id="t-exc" label="Exclusions (one per line)"><textarea id="t-exc" rows={7} value={form.exclusions} onChange={set('exclusions')} className="input resize-y" /></Field>
              <div className="sm:col-span-2"><Field id="t-carry" label="Things to carry (one per line)"><textarea id="t-carry" rows={5} value={form.thingsToCarry} onChange={set('thingsToCarry')} className="input resize-y" /></Field></div>
              <div className="sm:col-span-2">
                <p className="label">Stays</p>
                <div className="space-y-2">
                  {form.stay.map((s, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_5rem_auto] items-center gap-2">
                      <input aria-label="Place" value={s.place} onChange={(e) => set('stay')(edit(form.stay, i, { place: e.target.value }))} className="input py-2" placeholder="Sankri" />
                      <input aria-label="Stay type" value={s.type} onChange={(e) => set('stay')(edit(form.stay, i, { type: e.target.value }))} className="input py-2" placeholder="Homestay" />
                      <input aria-label="Nights" type="number" min={1} value={s.nights} onChange={(e) => set('stay')(edit(form.stay, i, { nights: e.target.value }))} className="input py-2" />
                      <IconBtn label="Remove stay" tone="red" onClick={() => set('stay')(form.stay.filter((_, j) => j !== i))}><X size={15} /></IconBtn>
                    </div>
                  ))}
                  <AddButton onClick={() => set('stay')([...form.stay, { place: '', type: '', nights: 1 }])}>Add stay</AddButton>
                </div>
              </div>
              <div className="sm:col-span-2"><Field id="t-transport" label="Transport"><input id="t-transport" value={form.transport} onChange={set('transport')} className="input" placeholder="Tempo Traveller from Dehradun" /></Field></div>
              <Field id="t-weather" label="Weather"><textarea id="t-weather" rows={3} value={form.weather} onChange={set('weather')} className="input resize-y" /></Field>
              <Field id="t-pickup" label="Pickup details"><textarea id="t-pickup" rows={3} value={form.pickup} onChange={set('pickup')} className="input resize-y" /></Field>
            </div>
          )}

          {section === 'FAQs' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Questions specific to this trip. The standard FAQs (booking, safety, cancellations) are added automatically below these.</p>
              {form.faqs.map((f, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex gap-2">
                    <input aria-label={`Question ${i + 1}`} value={f.q} onChange={(e) => set('faqs')(edit(form.faqs, i, { q: e.target.value }))} className="input py-2" placeholder="Question" />
                    <IconBtn label={`Remove question ${i + 1}`} tone="red" onClick={() => set('faqs')(form.faqs.filter((_, j) => j !== i))}><Trash2 size={15} /></IconBtn>
                  </div>
                  <textarea aria-label={`Answer ${i + 1}`} rows={2} value={f.a} onChange={(e) => set('faqs')(edit(form.faqs, i, { a: e.target.value }))} className="input resize-y" placeholder="Answer" />
                </div>
              ))}
              <AddButton onClick={() => set('faqs')([...form.faqs, { q: '', a: '' }])}>Add question</AddButton>
            </div>
          )}

          {section === 'Dates' && (
            <div className="space-y-2">
              <p className="mb-2 text-sm text-slate-500">Fixed departure dates and seats left. Customers can only pay online for these dates.</p>
              {errors.departures && <p role="alert" className="text-sm font-semibold text-red-500">{errors.departures}</p>}
              {form.departures.map((d, i) => (
                <div key={i} className="grid grid-cols-[1fr_6rem_auto] items-center gap-2">
                  <input aria-label="Departure date" type="date" value={d.date} onChange={(e) => set('departures')(edit(form.departures, i, { date: e.target.value }))} className="input py-2" />
                  <input aria-label="Seats" type="number" min={0} value={d.seats} onChange={(e) => set('departures')(edit(form.departures, i, { seats: e.target.value }))} className="input py-2" />
                  <IconBtn label="Remove date" tone="red" onClick={() => set('departures')(form.departures.filter((_, j) => j !== i))}><X size={15} /></IconBtn>
                </div>
              ))}
              <AddButton onClick={() => set('departures')([...form.departures, { date: '', seats: form.seats || 16 }])}>Add departure</AddButton>
            </div>
          )}
        </form>
      </Modal>
    </>
  )
}

const edit = (arr, i, patch) => arr.map((x, j) => (j === i ? { ...x, ...patch } : x))
const move = (arr, i, dir) => { const a = [...arr]; [a[i], a[i + dir]] = [a[i + dir], a[i]]; return a }

function AddButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-sky-brand px-4 py-2 text-sm font-semibold text-sky-dark hover:bg-sky-light dark:text-sky-300 dark:hover:bg-slate-800">
      <Plus size={15} /> {children}
    </button>
  )
}

// Live preview of a photo link; explains the usual Drive sharing problem if it can't load.
function Preview({ url, className = '' }) {
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [url])
  if (broken) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 rounded-lg bg-amber-50 p-2 text-center text-[11px] text-amber-800 ${className}`}>
        <ImageOff size={16} /> Can’t load — set Drive sharing to “Anyone with the link”
      </div>
    )
  }
  return <img src={img(url)} alt="" onError={() => setBroken(true)} className={`rounded-lg bg-slate-100 object-cover ${className}`} />
}

function DriveHelp() {
  return (
    <details className="rounded-xl bg-sky-xlight p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <summary className="flex cursor-pointer items-center gap-2 font-semibold text-deep dark:text-white"><HelpCircle size={16} /> How to use Google Drive links</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>Upload the photo or PDF to Google Drive.</li>
        <li>Right-click the <strong>file</strong> → <strong>Share</strong> → under “General access” choose <strong>Anyone with the link</strong>.</li>
        <li>Click <strong>Copy link</strong> and paste it here. A preview appears if it works.</li>
      </ol>
      <p className="mt-2 flex items-start gap-1.5 text-xs"><AlertTriangle size={13} className="mt-0.5 shrink-0" /> Use links to individual files, not folders. Photos look best in landscape, at least 1600px wide.</p>
    </details>
  )
}
