import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, History, RotateCcw } from 'lucide-react'
import { Field } from '../pages/Contact'
import { DEFAULT_SETTINGS, useData } from '../context/DataContext'
import { useAdmin } from '../context/AdminContext'
import { adminApi, fetchContent } from '../lib/api'
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
    setSettings((s) => ({ ...s, ...form, whatsapp, popup: s.popup })) // keep popup settings (edited on their own page)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <button type="button" onClick={() => setForm(DEFAULT_SETTINGS)} className="rounded-pill border border-slate-200 px-5 py-3 text-sm font-semibold dark:border-slate-700">Reset fields to defaults</button>
        <AnimatePresence>
          {saved && <motion.span role="status" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1 text-sm font-semibold text-green-600"><Check size={16} /> Saved — live on the site</motion.span>}
        </AnimatePresence>
      </div>

      <VersionHistory />
    </form>
  )
}

// Every publish keeps the previous version on the server (last 30). Restore puts one back live.
function VersionHistory() {
  const { csrf } = useAdmin()
  const { replaceAll } = useData()
  const [list, setList] = useState(null)
  const [busy, setBusy] = useState(null)
  useEffect(() => { adminApi.backups().then((r) => setList(r.backups || [])) }, [])

  const label = (id) => {
    const m = id.match(/content-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/)
    return m ? new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : id
  }
  const restore = async (id) => {
    if (!window.confirm(`Put the website back to the version from ${label(id)}? (The current version is backed up first.)`)) return
    setBusy(id)
    const r = await adminApi.restore(id, csrf)
    if (r.ok) {
      const c = await fetchContent()
      if (c.state === 'ok') replaceAll(c.data)
      setList((await adminApi.backups()).backups || [])
    } else window.alert(r.error || 'Restore failed')
    setBusy(null)
  }

  return (
    <Panel title="Version history">
      <div className="p-5">
        <p className="mb-3 flex items-center gap-2 text-sm text-slate-500"><History size={16} /> Each time you save, the previous version is kept. Restore one if something goes wrong.</p>
        {list === null ? <p className="text-sm text-slate-400">Loading…</p> : list.length === 0 ? <p className="text-sm text-slate-400">No earlier versions yet.</p> : (
          <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-100 dark:divide-slate-700 dark:border-slate-700">
            {list.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span>{label(b.id)}{b.id.includes('before-restore') && <span className="ml-2 text-xs text-slate-400">(before a restore)</span>}</span>
                <button type="button" disabled={!!busy} onClick={() => restore(b.id)} className="inline-flex items-center gap-1 rounded-pill border border-slate-200 px-3 py-1 text-xs font-semibold hover:border-sky-brand hover:text-sky-dark disabled:opacity-50 dark:border-slate-600">
                  <RotateCcw size={12} /> {busy === b.id ? 'Restoring…' : 'Restore'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  )
}
