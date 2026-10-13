import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RotateCcw, XCircle } from 'lucide-react'
import Seo from '../components/ui/Seo'
import Button from '../components/ui/Button'
import SuccessCheck from '../components/ui/SuccessCheck'
import { WhatsAppIcon } from '../components/ui/BrandIcons'
import { useData } from '../context/DataContext'
import { fmtDate, inr } from '../lib/format'

// Landing pages PayU's callback (api/payu/response.php) redirects to after verifying the payment.
export default function PaymentResult({ status }) {
  const [q] = useSearchParams()
  const { publicTrips, waLink } = useData()
  const trip = publicTrips.find((t) => t.slug === q.get('trip'))
  const txnid = q.get('txnid') || '—'
  const amount = Number(q.get('amount')) || 0
  const date = /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') || '') ? q.get('date') : null

  if (status === 'success') {
    const msg = `Hi! I just paid ${inr(amount)} for ${trip?.name || 'a trip'}${date ? ` on ${fmtDate(date)}` : ''}. Transaction ID: ${txnid}`
    return (
      <div className="container-x max-w-xl py-16">
        <Seo title="Booking confirmed" noindex />
        <div className="card p-6 md:p-10">
          <SuccessCheck title="Payment successful — you’re going! 🎉" message="Your seat is reserved. Our team will WhatsApp you within a few hours with the trip group link and packing list.">
            <dl className="mx-auto mb-6 max-w-sm space-y-2 rounded-xl bg-sky-xlight p-4 text-left text-sm dark:bg-slate-900">
              {trip && <Row k="Trip" v={trip.name} />}
              {date && <Row k="Departure" v={fmtDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />}
              {q.get('people') && <Row k="Travellers" v={q.get('people')} />}
              <Row k="Paid" v={`${inr(amount)}${q.get('plan') === 'advance' ? ' (advance)' : ''}`} />
              <Row k="Transaction ID" v={txnid} />
            </dl>
            <div className="flex flex-wrap justify-center gap-3">
              <Button href={waLink(msg)} variant="whatsapp"><WhatsAppIcon size={18} /> Send confirmation on WhatsApp</Button>
              <Button to="/" variant="ghost">Back to home</Button>
            </div>
            <p className="mt-4 text-xs text-slate-500">Please keep your Transaction ID. A receipt is also emailed by PayU.</p>
          </SuccessCheck>
        </div>
      </div>
    )
  }

  const reason = q.get('reason')
  return (
    <div className="container-x max-w-xl py-16">
      <Seo title="Payment not completed" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center md:p-10">
        <XCircle size={64} className="mx-auto text-red-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-deep dark:text-white">Payment not completed</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {reason === 'verification'
            ? 'We could not verify this payment. If money was deducted, it will be auto-refunded by your bank — or message us and we’ll sort it out.'
            : 'The payment was cancelled or declined. No money has been taken. You can try again or book on WhatsApp.'}
        </p>
        {txnid !== '—' && <p className="mt-3 text-xs text-slate-500">Reference: {txnid}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {trip && <Button to={`/trips/${trip.slug}${date ? `?date=${date}` : ''}#book`}><RotateCcw size={16} /> Try again</Button>}
          <Button href={waLink(`Hi! My payment didn't go through${trip ? ` for ${trip.name}` : ''}. Reference: ${txnid}`)} variant="whatsapp"><WhatsAppIcon size={18} /> Help on WhatsApp</Button>
        </div>
      </motion.div>
    </div>
  )
}

const Row = ({ k, v }) => (
  <div className="flex justify-between gap-4"><dt className="text-slate-500">{k}</dt><dd className="text-right font-semibold text-slate-900 dark:text-white">{v}</dd></div>
)
