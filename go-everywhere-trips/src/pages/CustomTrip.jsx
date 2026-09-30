import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from 'lucide-react'
import Seo from '../components/ui/Seo'
import PageHero from '../components/ui/PageHero'
import Button from '../components/ui/Button'
import SuccessCheck from '../components/ui/SuccessCheck'
import { WhatsAppIcon } from '../components/ui/BrandIcons'
import { Field } from './Contact'
import { IMAGES } from '../data/images'
import { useData } from '../context/DataContext'
import { fmtDate, inr } from '../lib/format'
import { isEmail, isPhone } from '../lib/validate'

const DESTINATIONS = ['Uttarakhand', 'Himachal', 'Spiti Valley', 'Kashmir', 'Ladakh', 'Rajasthan', 'Kerala', 'Andaman', 'Goa', 'Sikkim', 'Meghalaya', 'Char Dham']
const HOTELS = [
  { id: 'Budget', icon: '🏕', desc: 'Camps & homestays' },
  { id: 'Standard', icon: '🏨', desc: 'Clean 2–3★ hotels' },
  { id: 'Deluxe', icon: '✨', desc: 'Boutique & 4★' },
  { id: 'Luxury', icon: '👑', desc: '5★ & heritage' },
]
const VEHICLES = ['Tempo Traveller', 'SUV', 'Bus', 'Train']
const ACTIVITIES = ['Trekking', 'Camping', 'Sightseeing', 'Water Sports', 'Paragliding', 'Photography']
const STEPS = ['Where & When', 'Preferences', 'Contact']

const INITIAL = {
  destination: '', otherDestination: '', from: '', to: '', people: 2,
  hotel: 'Standard', vehicle: 'Tempo Traveller', activities: [],
  budget: 15000, notes: '', name: '', phone: '', email: '',
}

const slide = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

export default function CustomTrip() {
  const { addLead, waLink, trackWhatsApp } = useData()
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const set = (k, v) => { setData((d) => ({ ...d, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }
  const toggleActivity = (a) => set('activities', data.activities.includes(a) ? data.activities.filter((x) => x !== a) : [...data.activities, a])
  const today = new Date().toISOString().slice(0, 10)
  const where = data.destination === 'Other' ? data.otherDestination : data.destination

  const validate = (s) => {
    const e = {}
    if (s === 1) {
      if (!where.trim()) e.destination = 'Pick a destination (or type your own)'
      if (!data.from) e.from = 'Choose a start date'
      if (data.to && data.from && data.to < data.from) e.to = 'End date must be after start date'
    }
    if (s === 3) {
      if (!data.name.trim()) e.name = 'Please tell us your name'
      if (!isPhone(data.phone)) e.phone = 'Enter a valid 10-digit mobile number'
      if (data.email && !isEmail(data.email)) e.email = 'Enter a valid email'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const go = (to) => {
    if (to > step && !validate(step)) return
    setDir(to > step ? 1 : -1)
    setStep(to)
  }

  const summary = `Custom trip · ${where} · ${data.people} people · ${data.hotel} · ${data.vehicle}${data.from ? ` · ${fmtDate(data.from)}` : ''}${data.to ? ` → ${fmtDate(data.to)}` : ''} · Budget ${inr(data.budget)}/person${data.activities.length ? ` · ${data.activities.join(', ')}` : ''}${data.notes ? ` · Notes: ${data.notes}` : ''}`

  const submit = (e) => {
    e.preventDefault()
    if (step < 3) return go(step + 1) // Enter key on an earlier step advances instead of submitting
    if (!validate(3)) return
    addLead({ source: 'custom', name: data.name, phone: data.phone, email: data.email || '—', enquiry: summary })
    setDone(true)
  }

  const progress = `${(step / STEPS.length) * 100}%`

  return (
    <>
      <Seo title="Plan a Custom Trip" description="Tell us where, when and how you like to travel — we’ll design a private itinerary with stays, transport and activities in 24 hours." image={IMAGES.customTrips} />
      <PageHero image={IMAGES.customTrips} eyebrow="Your trip, your way" title="Plan a Custom Trip" subtitle="Three quick steps. A handcrafted itinerary on your WhatsApp within 24 hours." />

      <div className="container-x max-w-3xl py-14">
        <div className="card overflow-hidden">
          {done ? (
            <div className="p-6 md:p-10">
              <SuccessCheck title="Request received! 🎉" message={`Thanks ${data.name.split(' ')[0]} — a travel designer will WhatsApp you on ${data.phone} within 24 hours with a custom plan for ${where}.`}>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button href={waLink(`Hi! I just submitted a custom trip request.\n${summary}`)} variant="whatsapp" onClick={() => trackWhatsApp('Custom trip follow-up')}>
                    <WhatsAppIcon size={18} /> Speed it up on WhatsApp
                  </Button>
                  <Button variant="ghost" onClick={() => { setData(INITIAL); setStep(1); setDone(false) }}>Plan another trip</Button>
                </div>
              </SuccessCheck>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="border-b border-slate-100 p-6 dark:border-slate-700">
                <ol className="mb-4 flex items-center justify-between">
                  {STEPS.map((label, i) => {
                    const n = i + 1
                    const state = n < step ? 'done' : n === step ? 'current' : 'todo'
                    return (
                      <li key={label} className="flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={state === 'current' ? 'step' : undefined}>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                          state === 'todo' ? 'border-slate-300 text-slate-400 dark:border-slate-600' : 'border-sky-brand bg-sky-brand text-white'
                        } ${state === 'current' ? 'shadow-glow' : ''}`}>
                          {state === 'done' ? <Check size={16} /> : n}
                        </span>
                        <span className={`text-xs font-semibold ${state === 'todo' ? 'text-slate-400' : 'text-deep dark:text-white'}`}>{label}</span>
                      </li>
                    )
                  })}
                </ol>
                <div className="h-2 overflow-hidden rounded-pill bg-sky-light dark:bg-slate-700" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Step ${step} of 3`}>
                  <motion.div className="h-full rounded-pill bg-sky-brand" initial={false} animate={{ width: progress }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} />
                </div>
              </div>

              <form onSubmit={submit} noValidate className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }} className="space-y-6 p-6 md:p-8">
                    {step === 1 && (
                      <>
                        <fieldset>
                          <legend className="label">Where do you want to go? *</legend>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {[...DESTINATIONS, 'Other'].map((d) => (
                              <button key={d} type="button" aria-pressed={data.destination === d} onClick={() => set('destination', d)}
                                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${data.destination === d ? 'border-sky-brand bg-sky-brand text-white shadow-glow' : 'border-slate-200 hover:border-sky-brand dark:border-slate-600'}`}>
                                {d}
                              </button>
                            ))}
                          </div>
                          {data.destination === 'Other' && (
                            <input aria-label="Type your destination" value={data.otherDestination} onChange={(e) => set('otherDestination', e.target.value)} className="input mt-3" placeholder="Type your destination" autoFocus />
                          )}
                          {errors.destination && <p className="mt-1 text-xs font-semibold text-red-500" role="alert">{errors.destination}</p>}
                        </fieldset>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field id="from" label="From *" error={errors.from}><input id="from" type="date" min={today} value={data.from} onChange={(e) => set('from', e.target.value)} className="input" /></Field>
                          <Field id="to" label="To" error={errors.to}><input id="to" type="date" min={data.from || today} value={data.to} onChange={(e) => set('to', e.target.value)} className="input" /></Field>
                        </div>
                        <div>
                          <span id="people-label" className="label">Number of travellers</span>
                          <div className="inline-flex items-center gap-4 rounded-xl border border-slate-200 p-1.5 dark:border-slate-600" role="group" aria-labelledby="people-label">
                            <button type="button" onClick={() => set('people', Math.max(1, data.people - 1))} aria-label="Decrease travellers" className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-light text-sky-dark hover:bg-sky-brand hover:text-white dark:bg-slate-700 dark:text-white"><Minus size={18} /></button>
                            <span className="w-10 text-center text-xl font-bold" aria-live="polite">{data.people}</span>
                            <button type="button" onClick={() => set('people', Math.min(99, data.people + 1))} aria-label="Increase travellers" className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-light text-sky-dark hover:bg-sky-brand hover:text-white dark:bg-slate-700 dark:text-white"><Plus size={18} /></button>
                          </div>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <fieldset>
                          <legend className="label">Hotel category</legend>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {HOTELS.map((h) => (
                              <motion.button key={h.id} type="button" whileTap={{ scale: 0.96 }} aria-pressed={data.hotel === h.id} onClick={() => set('hotel', h.id)}
                                className={`rounded-2xl border-2 p-4 text-center transition-all ${data.hotel === h.id ? 'border-sky-brand bg-sky-light shadow-glow dark:bg-sky-500/15' : 'border-slate-200 hover:border-sky-brand dark:border-slate-600'}`}>
                                <span className="block text-3xl" aria-hidden="true">{h.icon}</span>
                                <span className="mt-1 block font-bold">{h.id}</span>
                                <span className="block text-xs text-slate-500">{h.desc}</span>
                              </motion.button>
                            ))}
                          </div>
                        </fieldset>
                        <fieldset>
                          <legend className="label">Vehicle type</legend>
                          <div className="flex flex-wrap gap-2">
                            {VEHICLES.map((v) => (
                              <button key={v} type="button" aria-pressed={data.vehicle === v} onClick={() => set('vehicle', v)}
                                className={`rounded-pill border px-4 py-2 text-sm font-semibold ${data.vehicle === v ? 'border-sky-brand bg-sky-brand text-white' : 'border-slate-200 hover:border-sky-brand dark:border-slate-600'}`}>{v}</button>
                            ))}
                          </div>
                        </fieldset>
                        <fieldset>
                          <legend className="label">Activities <span className="font-normal text-slate-400">(pick any)</span></legend>
                          <div className="flex flex-wrap gap-2">
                            {ACTIVITIES.map((a) => {
                              const on = data.activities.includes(a)
                              return (
                                <button key={a} type="button" aria-pressed={on} onClick={() => toggleActivity(a)}
                                  className={`inline-flex items-center gap-1 rounded-pill border px-4 py-2 text-sm font-semibold transition-colors ${on ? 'border-sky-brand bg-sky-light text-sky-dark dark:bg-sky-500/15 dark:text-sky-300' : 'border-slate-200 hover:border-sky-brand dark:border-slate-600'}`}>
                                  {on && <Check size={14} aria-hidden="true" />}{a}
                                </button>
                              )
                            })}
                          </div>
                        </fieldset>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div>
                          <label htmlFor="budget" className="label">Budget per person: <span className="text-sky-brand">{inr(data.budget)}{data.budget >= 100000 ? '+' : ''}</span></label>
                          <input id="budget" type="range" min={5000} max={100000} step={1000} value={data.budget} onChange={(e) => set('budget', Number(e.target.value))} className="w-full accent-sky-brand" />
                          <div className="flex justify-between text-xs text-slate-400"><span>₹5K</span><span>₹1L+</span></div>
                        </div>
                        <Field id="notes" label="Special requirements"><textarea id="notes" rows={3} value={data.notes} onChange={(e) => set('notes', e.target.value)} className="input resize-none" placeholder="Anniversary surprise, senior citizens, Jain food, women-only group…" /></Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field id="ct-name" label="Name *" error={errors.name}><input id="ct-name" autoComplete="name" value={data.name} onChange={(e) => set('name', e.target.value)} className="input" /></Field>
                          <Field id="ct-phone" label="Phone (WhatsApp) *" error={errors.phone}><input id="ct-phone" type="tel" autoComplete="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} className="input" /></Field>
                        </div>
                        <Field id="ct-email" label="Email" error={errors.email}><input id="ct-email" type="email" autoComplete="email" value={data.email} onChange={(e) => set('email', e.target.value)} className="input" /></Field>
                        <div className="rounded-xl bg-sky-xlight p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          <strong className="text-deep dark:text-white">Your trip:</strong> {where || '—'} · {data.people} travellers · {data.hotel} stay · {data.vehicle}
                          {data.activities.length > 0 && <> · {data.activities.join(', ')}</>}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between border-t border-slate-100 p-6 dark:border-slate-700">
                  {step > 1 ? (
                    <Button variant="ghost" onClick={() => go(step - 1)}><ArrowLeft size={16} /> Back</Button>
                  ) : <span />}
                  {step < 3 ? (
                    <Button key="next" onClick={() => go(step + 1)}>Next <ArrowRight size={16} /></Button>
                  ) : (
                    <Button key="submit" type="submit">Get My Itinerary <ArrowRight size={16} /></Button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
