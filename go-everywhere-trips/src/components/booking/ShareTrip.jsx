import { useState } from 'react'
import { Check, Copy, Mail, Send, Share2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Img from '../ui/Img'
import { WhatsAppIcon } from '../ui/BrandIcons'
import { SITE_URL } from '../../site.config'
import { fromPrice } from '../../lib/sharing'
import { inr } from '../../lib/format'
import { track } from '../../lib/api'

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" /></svg>
)
const XIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z" /></svg>
)

// "Share this trip" — WhatsApp, Facebook, X, Telegram, Email, copy link, and the phone's own share sheet.
export default function ShareTrip({ trip }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const url = `${SITE_URL}/trips/${trip.slug}` // always the live link (with its preview image)
  const text = `${trip.name} — ${trip.duration} from ${trip.startingPoint}, from ${inr(fromPrice(trip))}/person. Check it out:`
  const enc = encodeURIComponent

  const targets = [
    { label: 'WhatsApp', Icon: WhatsAppIcon, cls: 'bg-green-500', href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { label: 'Facebook', Icon: FacebookIcon, cls: 'bg-[#1877F2]', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: 'X', Icon: XIcon, cls: 'bg-black', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: 'Telegram', Icon: Send, cls: 'bg-[#229ED9]', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
    { label: 'Email', Icon: Mail, cls: 'bg-slate-600', href: `mailto:?subject=${enc(trip.name)}&body=${enc(`${text}\n${url}`)}` },
  ]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const t = Object.assign(document.createElement('textarea'), { value: url })
      document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track(`Share · copy link · ${trip.name}`)
  }
  const native = () => navigator.share?.({ title: trip.name, text, url }).then(() => track(`Share · phone menu · ${trip.name}`)).catch(() => {})
  const canNative = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-pill border-2 border-sky-brand px-4 py-2 text-sm font-bold text-sky-dark transition-colors hover:bg-sky-brand hover:text-white dark:text-sky-300"
      >
        <Share2 size={16} aria-hidden="true" /> <span>Share</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Share this trip">
        <div className="flex items-center gap-3 rounded-xl bg-sky-xlight p-3 dark:bg-slate-800">
          <Img src={trip.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate font-bold text-deep dark:text-white">{trip.name}</p>
            <p className="text-xs text-slate-500">{trip.duration} · from {inr(fromPrice(trip))}/person</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-5">
          {targets.map(({ label, Icon, cls, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" onClick={() => track(`Share · ${label} · ${trip.name}`)}
              className="group flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-transform group-hover:scale-110 ${cls}`}><Icon size={20} /></span>
              {label}
            </a>
          ))}
          {canNative && (
            <button type="button" onClick={native} className="group flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-brand text-white shadow-md transition-transform group-hover:scale-110"><Share2 size={20} /></span>
              More apps
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pl-3 dark:border-slate-700">
          <span className="min-w-0 flex-1 truncate text-sm text-slate-500" title={url}>{url.replace(/^https:\/\//, '')}</span>
          <button type="button" onClick={copy} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-white transition-colors ${copied ? 'bg-green-500' : 'bg-deep hover:bg-deep-dark'}`}>
            {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy link</>}
          </button>
        </div>
      </Modal>
    </>
  )
}
