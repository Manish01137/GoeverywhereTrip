import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import Modal from '../ui/Modal'
import { Field } from '../../pages/Contact'
import { ADVANCE_PERCENT } from '../../site.config'
import { fmtDate, inr } from '../../lib/format'
import { isEmail, isPhone } from '../../lib/validate'

// Collects traveller details, then POSTs to the PHP endpoint which prices the trip,
// signs the request and forwards the customer to PayU's hosted checkout.
export default function CheckoutModal({ open, onClose, trip, date, people }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: 'advance', agree: false })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  const total = trip.price * people
  const advance = Math.round((total * ADVANCE_PERCENT) / 100) // whole rupees, same rounding as pay.php
  const payNow = form.plan === 'full' ? total : advance
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (form.name.trim().length < 2) er.name = 'Please enter your full name'
    if (!isEmail(form.email)) er.email = 'Enter a valid email — your receipt goes here'
    if (!isPhone(form.phone)) er.phone = 'Enter a valid 10-digit mobile number'
    if (!form.agree) er.agree = 'Please accept the cancellation policy'
    setErrors(er)
    if (Object.keys(er).length) return
    setSending(true)

    // A real form POST (not fetch) so the browser follows PayU's redirects like a normal checkout.
    const f = document.createElement('form')
    f.method = 'POST'
    f.action = '/api/payu/pay.php'
    const fields = { trip: trip.slug, date, people, plan: form.plan, name: form.name, email: form.email, phone: form.phone }
    Object.entries(fields).forEach(([name, value]) => f.appendChild(Object.assign(document.createElement('input'), { type: 'hidden', name, value })))
    document.body.appendChild(f)
    f.submit()
  }

  const option = (id, title, amount, note) => (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition-colors ${form.plan === id ? 'border-sky-brand bg-sky-xlight dark:bg-sky-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
      <input type="radio" name="plan" value={id} checked={form.plan === id} onChange={() => set('plan', id)} className="mt-1 accent-sky-brand" />
      <span className="flex-1">
        <span className="flex items-center justify-between gap-2 font-semibold text-slate-900 dark:text-white">{title}<span className="text-sky-brand">{inr(amount)}</span></span>
        <span className="block text-xs text-slate-500">{note}</span>
      </span>
    </label>
  )

  return (
    <Modal
      open={open}
      onClose={sending ? () => {} : onClose}
      title="Confirm your booking"
      footer={
        <button type="submit" form="checkout-form" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-pill bg-sky-brand py-3.5 font-bold text-white transition-colors hover:bg-sky-dark disabled:opacity-70">
          {sending ? <><Loader2 size={18} className="animate-spin" /> Opening PayU…</> : <><Lock size={16} /> Pay {inr(payNow)} securely</>}
        </button>
      }
    >
      <form id="checkout-form" onSubmit={submit} noValidate className="space-y-4">
        <div className="rounded-xl bg-sky-xlight p-4 text-sm dark:bg-slate-800">
          <p className="font-bold text-deep dark:text-white">{trip.name}</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{fmtDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {people} {people === 1 ? 'traveller' : 'travellers'} · {inr(total)} total</p>
        </div>

        <fieldset className="space-y-2">
          <legend className="label">How much would you like to pay now?</legend>
          {option('advance', `Reserve with ${ADVANCE_PERCENT}%`, advance, `Balance ${inr(total - advance)} due 7 days before departure`)}
          {option('full', 'Pay in full', total, 'Nothing more to pay later')}
        </fieldset>

        <Field id="co-name" label="Full name *" error={errors.name}><input id="co-name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} className="input" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="co-email" label="Email *" error={errors.email}><input id="co-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input" /></Field>
          <Field id="co-phone" label="Mobile (WhatsApp) *" error={errors.phone}><input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input" /></Field>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={form.agree} onChange={(e) => set('agree', e.target.checked)} className="mt-0.5 h-4 w-4 accent-sky-brand" />
          <span>I agree to the <Link to={`/trips/${trip.slug}#cancellation`} onClick={onClose} className="font-semibold text-sky-brand underline">cancellation policy</Link> and trip terms.</span>
        </label>
        {errors.agree && <p className="-mt-2 text-xs font-semibold text-red-500" role="alert">{errors.agree}</p>}

        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-green-600" aria-hidden="true" /> Secured by PayU · UPI, cards, net banking & wallets
        </p>
      </form>
    </Modal>
  )
}
