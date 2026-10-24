import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Clock, Loader2, MapPin, ShieldCheck, X } from 'lucide-react'
import Img from '../ui/Img'
import { useFocusTrap } from '../ui/Modal'
import { WhatsAppIcon } from '../ui/BrandIcons'
import { useData } from '../../context/DataContext'
import { isPhone } from '../../lib/validate'
import { fmtDate, upcoming } from '../../lib/format'

const STORE = 'get-popup-v2' // { lastShown, submitted }
const SESSION = 'get-popup-shown' // set once per visit (browser tab session)
const ALWAYS_SKIP = ['/admin', '/payment']

const read = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {} } catch { return {} } }
const write = (patch) => { try { localStorage.setItem(STORE, JSON.stringify({ ...read(), ...patch })) } catch { /* private mode */ } }
const shownThisVisit = () => { try { return sessionStorage.getItem(SESSION) === '1' } catch { return false } }
const markShownThisVisit = () => { try { sessionStorage.setItem(SESSION, '1') } catch { /* ignore */ } }

// Decides whether this visit should see the popup, based on the admin's Popup settings.
function shouldShow(cfg) {
  if (!cfg.enabled) return false
  if (typeof navigator !== 'undefined' && navigator.webdriver) return false // crawlers / prerender
  if (shownThisVisit()) return false // once per visit — not on every page change
  const s = read()
  if (cfg.stopAfterSubmit && s.submitted) return false
  if (cfg.frequency === 'every-days' && s.lastShown && Date.now() - s.lastShown < (Number(cfg.everyDays) || 1) * 864e5) return false
  return true // 'every-visit': every new visit, including returning visitors
}

// Timed "plan your trip" lead form. Mounted once inside the router.
export default function LeadPopup() {
  const { pathname } = useLocation()
  const { popup: cfg, source } = useData()
  const [open, setOpen] = useState(false)
  const skip = [...ALWAYS_SKIP, ...(cfg.hideOn || [])].some((p) => p && pathname.startsWith(p))

  useEffect(() => {
    // Wait for the server's settings so the admin's latest text/rules apply.
    if (source === 'loading' || skip || open || !shouldShow(cfg)) return
    let t
    const tryOpen = () => {
      // Wait if the mobile menu, checkout or another dialog is already open.
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) { t = setTimeout(tryOpen, 5000); return }
      if (!shouldShow(cfg)) return
      markShownThisVisit()
      write({ lastShown: Date.now() })
      setOpen(true)
    }
    t = setTimeout(tryOpen, Math.max(0, Number(cfg.delaySeconds) || 0) * 1000)
    return () => clearTimeout(t)
  }, [skip, open, cfg, source])

  const close = useCallback(() => setOpen(false), [])
  return <AnimatePresence>{open && <PopupDialog config={cfg} onClose={close} />}</AnimatePresence>
}

// Also used by Admin → Popup for the live preview (preview = nothing is sent).
export function PopupDialog({ config: cfg, onClose, preview = false }) {
  const { addLead, waLink, trackWhatsApp, publicTrips } = useData()
  const ref = useFocusTrap(true, onClose)
  const months = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() + i, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }))
  }, [])
  // "Upcoming departures" mode lists real trips + dates from the admin's Departures.
  const destinationOptions = useMemo(() => {
    if (cfg.destinationMode !== 'departures') return (cfg.destinations || []).filter(Boolean)
    return publicTrips
      .flatMap((t) => upcoming(t.departures).filter((d) => d.seats > 0).map((d) => ({ date: d.date, label: `${t.name} — ${fmtDate(d.date, { day: 'numeric', month: 'short' })}` })))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 25)
      .map((o) => o.label)
  }, [cfg.destinationMode, cfg.destinations, publicTrips])

  const [f, setF] = useState({ name: '', phone: '', destination: '', month: '', group: '', website: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (f.name.trim().length < 2) er.name = 'Please enter your name'
    if (!isPhone(f.phone)) er.phone = 'Enter a valid 10-digit WhatsApp number'
    setErrors(er)
    if (Object.keys(er).length) return
    if (preview) { setStatus('done'); return }
    setStatus('sending')
    const enquiry = [
      cfg.askDestination && `${cfg.destinationMode === 'departures' ? 'Trip' : 'Destination'}: ${f.destination || 'Not sure yet'}`,
      cfg.askMonth && cfg.destinationMode !== 'departures' && `When: ${f.month || 'Flexible'}`,
      cfg.askGroup && `Travellers: ${f.group || 'Not specified'}`,
    ].filter(Boolean).join(' · ') || 'Asked to be contacted'
    const res = await addLead({ source: 'popup', name: f.name.trim(), phone: f.phone, email: '—', enquiry, website: f.website })
    if (res?.ok) { write({ submitted: true }); setStatus('done') } else setStatus('error')
  }

  const waText = `Hi! I'm ${f.name || 'interested'} — planning a trip${f.destination ? ` (${f.destination})` : ''}${f.month ? ` in ${f.month}` : ''}${f.group ? ` for ${f.group}` : ''}. Please share options.`
  const bulletIcons = [Clock, MapPin, ShieldCheck]

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
      <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative grid max-h-[92dvh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl focus:outline-none dark:bg-slate-900 sm:rounded-3xl md:grid-cols-[0.9fr_1.1fr]"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white dark:bg-slate-800 dark:text-white">
          <X size={18} />
        </button>

        {/* Visual side (tablet & desktop) */}
        <div className="relative hidden md:block">
          <Img src={cfg.image || 'customTrips'} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-dark via-deep/50 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-white">
            <p className="text-2xl font-black leading-tight">{cfg.sideTitle}<br /><span className="text-sun">{cfg.sideHighlight}</span></p>
            {(cfg.bullets || []).filter(Boolean).slice(0, 5).map((t, i) => {
              const Icon = bulletIcons[i % bulletIcons.length]
              return <p key={i} className="flex items-center gap-2 text-sm text-white/90"><Icon size={16} className="shrink-0 text-sky-300" aria-hidden="true" />{t}</p>
            })}
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">
          {status === 'done' ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 size={64} className="text-green-500" aria-hidden="true" />
              <h2 id="popup-title" className="mt-4 text-2xl font-bold text-deep dark:text-white">{cfg.successTitle}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{cfg.successText}</p>
              {preview && <p className="mt-2 text-xs font-semibold text-amber-600">Preview — nothing was sent.</p>}
              <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp('Popup — after submit')} className="mt-6 inline-flex items-center gap-2 rounded-pill bg-green-500 px-6 py-3 font-bold text-white hover:bg-green-600">
                <WhatsAppIcon size={18} /> Chat now on WhatsApp
              </a>
              <Link to="/trips" onClick={onClose} className="mt-3 text-sm font-semibold text-sky-brand hover:underline">Browse upcoming trips →</Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-3.5">
              <div className="pr-8">
                {cfg.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-brand">{cfg.eyebrow}</p>}
                <h2 id="popup-title" className="mt-1 text-2xl font-bold leading-tight text-deep dark:text-white">{cfg.title}</h2>
                {cfg.subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{cfg.subtitle}</p>}
              </div>

              {/* Honeypot: hidden from people, filled in by bots */}
              <input type="text" name="website" value={f.website} onChange={(e) => set('website', e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="pp-name" className="label">Your name *</label>
                  <input id="pp-name" autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} className="input py-2.5" />
                  {errors.name && <p className="mt-1 text-xs font-semibold text-red-500" role="alert">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="pp-phone" className="label">WhatsApp number *</label>
                  <input id="pp-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={f.phone} onChange={(e) => set('phone', e.target.value)} className="input py-2.5" />
                  {errors.phone && <p className="mt-1 text-xs font-semibold text-red-500" role="alert">{errors.phone}</p>}
                </div>
              </div>
              {cfg.askDestination && destinationOptions.length > 0 && (
                <div>
                  <label htmlFor="pp-dest" className="label">{cfg.destinationMode === 'departures' ? 'Upcoming departure' : 'Destination'}</label>
                  <select id="pp-dest" value={f.destination} onChange={(e) => set('destination', e.target.value)} className="input py-2.5">
                    <option value="">{cfg.destinationMode === 'departures' ? 'Any trip — suggest one' : 'Not sure yet — suggest something'}</option>
                    {destinationOptions.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              )}
              {(cfg.askMonth && cfg.destinationMode !== 'departures') || cfg.askGroup ? (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {cfg.askMonth && cfg.destinationMode !== 'departures' && (
                    <div>
                      <label htmlFor="pp-month" className="label">When?</label>
                      <select id="pp-month" value={f.month} onChange={(e) => set('month', e.target.value)} className="input py-2.5">
                        <option value="">I’m flexible</option>
                        {months.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  )}
                  {cfg.askGroup && (
                    <div>
                      <label htmlFor="pp-group" className="label">Travellers</label>
                      <select id="pp-group" value={f.group} onChange={(e) => set('group', e.target.value)} className="input py-2.5">
                        <option value="">Select</option>
                        {(cfg.groups || []).filter(Boolean).map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ) : null}

              {status === 'error' && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  Couldn’t send that just now. <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="font-bold underline">Send it on WhatsApp instead</a>.
                </p>
              )}

              <button type="submit" disabled={status === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-pill bg-sky-brand py-3.5 font-bold text-white shadow-lg shadow-sky-brand/30 transition-colors hover:bg-sky-dark disabled:opacity-70">
                {status === 'sending' ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : cfg.buttonText}
              </button>
              {cfg.footnote && <p className="text-center text-xs text-slate-400">{cfg.footnote}</p>}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
