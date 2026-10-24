import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Check, Eye, Plus, X } from 'lucide-react'
import Img from '../components/ui/Img'
import { Field } from '../pages/Contact'
import { PopupDialog } from '../components/layout/LeadPopup'
import { useData } from '../context/DataContext'
import { DEFAULT_POPUP } from '../data/popup'
import { isDriveFolder } from '../data/images'
import { upcoming } from '../lib/format'
import { Panel } from './ui'

// Admin → Popup: everything about the welcome popup — on/off, timing, how often, text, image, fields.
export default function AdminPopup() {
  const { popup, setSettings, publicTrips } = useData()
  const [form, setForm] = useState(popup)
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => setForm(popup), [popup])

  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v?.target ? (v.target.type === 'checkbox' ? v.target.checked : v.target.value) : v })); setSaved(false) }
  const departures = publicTrips.reduce((n, t) => n + upcoming(t.departures).filter((d) => d.seats > 0).length, 0)

  const save = (e) => {
    e.preventDefault()
    const clean = {
      ...form,
      delaySeconds: Math.min(120, Math.max(0, Number(form.delaySeconds) || 0)),
      everyDays: Math.max(1, Number(form.everyDays) || 1),
      bullets: (form.bullets || []).map((b) => b.trim()).filter(Boolean),
      destinations: (form.destinations || []).map((b) => b.trim()).filter(Boolean),
      groups: (form.groups || []).map((b) => b.trim()).filter(Boolean),
      hideOn: (form.hideOn || []).map((p) => p.trim()).filter(Boolean).map((p) => (p.startsWith('/') ? p : `/${p}`)),
    }
    setSettings((s) => ({ ...s, popup: clean })) // auto-publishes (see AdminLayout)
    setSaved(true)
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <Panel
        title="Welcome popup"
        action={
          <button type="button" onClick={() => setPreview(true)} className="inline-flex items-center gap-2 rounded-pill border border-sky-brand px-4 py-2 text-sm font-semibold text-sky-dark hover:bg-sky-light dark:text-sky-300 dark:hover:bg-slate-800">
            <Eye size={16} /> Preview
          </button>
        }
      >
        <div className="space-y-5 p-5">
          <Toggle checked={form.enabled} onChange={set('enabled')} label="Show the popup on the website" hint="Turn off to hide it everywhere." />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pp-delay" label="Show after (seconds)">
              <input id="pp-delay" type="number" min={0} max={120} value={form.delaySeconds} onChange={set('delaySeconds')} className="input" />
            </Field>
            <Field id="pp-freq" label="How often">
              <select id="pp-freq" value={form.frequency} onChange={set('frequency')} className="input">
                <option value="every-visit">Every visit (returning visitors too)</option>
                <option value="every-days">At most once every few days</option>
              </select>
            </Field>
            {form.frequency === 'every-days' && (
              <Field id="pp-days" label="Number of days between showings">
                <input id="pp-days" type="number" min={1} value={form.everyDays} onChange={set('everyDays')} className="input" />
              </Field>
            )}
          </div>
          <p className="-mt-2 text-xs text-slate-500">It appears once per visit (not again on every page they open during the same visit), and again on their next visit.</p>
          <Toggle checked={form.stopAfterSubmit} onChange={set('stopAfterSubmit')} label="Stop showing it to people who already filled it in" />
          <ListField id="pp-hide" label="Don’t show on these pages" hint="Page addresses, e.g. /contact. Admin and payment pages are always excluded." value={form.hideOn} onChange={set('hideOn')} placeholder="/custom-trip" />
        </div>
      </Panel>

      <Panel title="Text">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field id="pp-eyebrow" label="Small heading"><input id="pp-eyebrow" value={form.eyebrow} onChange={set('eyebrow')} className="input" /></Field>
          <Field id="pp-btn" label="Button text"><input id="pp-btn" value={form.buttonText} onChange={set('buttonText')} className="input" /></Field>
          <div className="sm:col-span-2"><Field id="pp-title" label="Main heading"><input id="pp-title" value={form.title} onChange={set('title')} className="input" /></Field></div>
          <div className="sm:col-span-2"><Field id="pp-sub" label="Subtitle"><textarea id="pp-sub" rows={2} value={form.subtitle} onChange={set('subtitle')} className="input resize-y" /></Field></div>
          <div className="sm:col-span-2"><Field id="pp-foot" label="Small print under the button"><input id="pp-foot" value={form.footnote} onChange={set('footnote')} className="input" /></Field></div>
          <Field id="pp-stitle" label="Thank-you heading"><input id="pp-stitle" value={form.successTitle} onChange={set('successTitle')} className="input" /></Field>
          <Field id="pp-stext" label="Thank-you message"><input id="pp-stext" value={form.successText} onChange={set('successText')} className="input" /></Field>
        </div>
      </Panel>

      <Panel title="Photo side (tablet & desktop)">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="pp-img" label="Photo (Google Drive or image link)" error={isDriveFolder(form.image) ? 'Use a link to the photo file, not a folder' : undefined}>
              <input id="pp-img" value={form.image === 'customTrips' ? '' : form.image} onChange={(e) => set('image')(e.target.value || 'customTrips')} className="input" placeholder="Leave empty for the default boat photo" />
            </Field>
            <Img src={form.image || 'customTrips'} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />
          </div>
          <Field id="pp-side1" label="Photo heading — line 1"><input id="pp-side1" value={form.sideTitle} onChange={set('sideTitle')} className="input" /></Field>
          <Field id="pp-side2" label="Photo heading — line 2 (yellow)"><input id="pp-side2" value={form.sideHighlight} onChange={set('sideHighlight')} className="input" /></Field>
          <div className="sm:col-span-2"><ListField id="pp-bullets" label="Bullet points" value={form.bullets} onChange={set('bullets')} placeholder="Free itinerary in 24 hours" /></div>
        </div>
      </Panel>

      <Panel title="Questions">
        <div className="space-y-5 p-5">
          <Toggle checked={form.askDestination} onChange={set('askDestination')} label="Ask where they want to go" />
          {form.askDestination && (
            <div className="ml-12 space-y-3">
              <fieldset className="space-y-2 text-sm">
                <legend className="sr-only">Destination options</legend>
                <label className="flex items-start gap-2"><input type="radio" name="dmode" checked={form.destinationMode !== 'departures'} onChange={() => set('destinationMode')('list')} className="mt-1 accent-sky-brand" /> My own list of destinations</label>
                <label className="flex items-start gap-2"><input type="radio" name="dmode" checked={form.destinationMode === 'departures'} onChange={() => set('destinationMode')('departures')} className="mt-1 accent-sky-brand" />
                  <span>Upcoming departures (automatic — trip name + date, from Admin → Departures; {departures} with seats right now)</span>
                </label>
              </fieldset>
              {form.destinationMode !== 'departures' && <ListField id="pp-dests" label="Destinations" value={form.destinations} onChange={set('destinations')} placeholder="Spiti Valley" />}
            </div>
          )}
          <Toggle checked={form.askMonth} onChange={set('askMonth')} label="Ask which month" hint={form.destinationMode === 'departures' ? 'Not needed when listing departures (they include the date).' : undefined} />
          <Toggle checked={form.askGroup} onChange={set('askGroup')} label="Ask how many travellers" />
          {form.askGroup && <div className="ml-12"><ListField id="pp-groups" label="Traveller options" value={form.groups} onChange={set('groups')} placeholder="3–5 people" /></div>}
          <p className="text-xs text-slate-500">Name and WhatsApp number are always asked.</p>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-pill bg-sky-brand px-6 py-3 text-sm font-bold text-white hover:bg-sky-dark">Save popup</button>
        <button type="button" onClick={() => { setForm(DEFAULT_POPUP); setSaved(false) }} className="rounded-pill border border-slate-200 px-5 py-3 text-sm font-semibold dark:border-slate-700">Reset fields to defaults</button>
        {saved && <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-green-600"><Check size={16} /> Saved — publishing to the website</span>}
      </div>

      <AnimatePresence>{preview && <PopupDialog config={form} preview onClose={() => setPreview(false)} />}</AnimatePresence>
    </form>
  )
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-sky-brand' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.375rem]' : 'left-0.5'}`} />
      </button>
      <span>
        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  )
}

// Editable list of short text items (add / edit / remove).
function ListField({ id, label, hint, value = [], onChange, placeholder }) {
  const items = value.length ? value : ['']
  const update = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)))
  return (
    <div>
      <p id={id} className="label">{label}</p>
      {hint && <p className="-mt-1 mb-2 text-xs text-slate-500">{hint}</p>}
      <div className="space-y-2" role="group" aria-labelledby={id}>
        {items.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input aria-label={`${label} ${i + 1}`} value={v} onChange={(e) => update(i, e.target.value)} className="input py-2" placeholder={placeholder} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove ${label} ${i + 1}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><X size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-sky-brand px-4 py-1.5 text-sm font-semibold text-sky-dark hover:bg-sky-light dark:text-sky-300 dark:hover:bg-slate-800">
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  )
}
