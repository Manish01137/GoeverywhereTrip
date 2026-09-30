import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { Field } from '../pages/Contact'
import { DATA_KEYS, DEFAULT_SETTINGS, useData } from '../context/DataContext'
import { Panel } from './ui'

const GROUPS = [
  { title: 'Homepage Hero', fields: [
    { k: 'heroTitle1', label: 'Headline line 1 (before the photo pill)', hint: 'e.g. Book Your' },
    { k: 'heroTitle2', label: 'Headline line 2 (before the rotating destination)', hint: 'e.g. Trip to' },
    { k: 'heroSubtitle', label: 'Subtitle under the tagline' },
  ] },
  { title: 'Contact', fields: [
    { k: 'whatsapp', label: 'WhatsApp number (with country code, digits only)', hint: 'e.g. 919410776387' },
    { k: 'phoneDisplay', label: 'Phone (as displayed)' },
    { k: 'email', label: 'Email' },
    { k: 'address', label: 'Address' },
  ] },
  { title: 'Social Media', fields: [
    { k: 'instagram', label: 'Instagram URL' },
    { k: 'youtube', label: 'YouTube URL' },
  ] },
]

export default function AdminSettings() {
  const { settings, setSettings } = useData()
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const save = (e) => {
    e.preventDefault()
    const whatsapp = form.whatsapp.replace(/\D/g, '')
    if (whatsapp.length < 11) return setError('WhatsApp number needs the country code, e.g. 919410776387')
    setError('')
    setSettings({ ...form, whatsapp })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetAll = () => {
    if (!window.confirm('Reset ALL demo data (trips, blogs, reviews, leads, settings) to defaults?')) return
    DATA_KEYS.forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      {GROUPS.map((g) => (
        <Panel key={g.title} title={g.title}>
          <div className="space-y-4 p-5">
            {g.fields.map((f) => (
              <Field key={f.k} id={`s-${f.k}`} label={f.label}>
                {f.textarea
                  ? <textarea id={`s-${f.k}`} rows={3} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className="input resize-none" />
                  : <input id={`s-${f.k}`} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className="input" placeholder={DEFAULT_SETTINGS[f.k]} />}
                {f.hint && <p className="mt-1 text-xs text-slate-400">{f.hint}</p>}
              </Field>
            ))}
          </div>
        </Panel>
      ))}

      {error && <p role="alert" className="text-sm font-semibold text-red-500">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-pill bg-sky-brand px-6 py-3 text-sm font-bold text-white hover:bg-sky-dark">Save Settings</button>
        <button type="button" onClick={() => setForm(DEFAULT_SETTINGS)} className="rounded-pill border border-slate-200 px-5 py-3 text-sm font-semibold dark:border-slate-700">Restore defaults</button>
        <AnimatePresence>
          {saved && <motion.span role="status" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1 text-sm font-semibold text-green-600"><Check size={16} /> Saved — live on the site</motion.span>}
        </AnimatePresence>
      </div>

      <Panel title="Danger zone" className="ring-1 ring-red-200 dark:ring-red-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-slate-500">Wipe everything edited in this browser and restore the original demo content.</p>
          <button type="button" onClick={resetAll} className="inline-flex items-center gap-2 rounded-pill bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600"><RotateCcw size={16} /> Reset demo data</button>
        </div>
      </Panel>
    </form>
  )
}
