import { useState } from 'react'
import { Download, Phone, RefreshCw } from 'lucide-react'
import { WhatsAppIcon } from '../components/ui/BrandIcons'
import { useAdmin } from '../context/AdminContext'
import { useData } from '../context/DataContext'
import { fmtDate } from '../lib/format'
import { adminApi } from '../lib/api'
import { inr } from '../lib/format'
import { downloadCSV } from './csv'
import useServerLeads from './useServerLeads'
import { EmptyRow, Panel, Table, Td } from './ui'

const TABS = [
  { id: 'all', label: 'All enquiries' },
  { id: 'popup', label: 'Website Popup' },
  { id: 'custom', label: 'Custom Trips' },
  { id: 'contact', label: 'Contact Form' },
  { id: 'payments', label: 'Bookings' },
  { id: 'clicks', label: 'WhatsApp Clicks' },
]
const SOURCE = { popup: 'Popup', custom: 'Custom trip', contact: 'Contact form' }
const RESULT = {
  success: ['Paid', 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'],
  failed: ['Failed', 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'],
  initiated: ['Not completed', 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'],
}
const STATUSES = ['New', 'Contacted', 'Converted', 'Closed']
const STATUS_CLS = {
  New: 'border-sky-brand text-sky-dark bg-sky-light dark:bg-sky-500/15 dark:text-sky-300',
  Contacted: 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-500/15 dark:text-orange-300',
  Converted: 'border-green-300 text-green-700 bg-green-50 dark:bg-green-500/15 dark:text-green-300',
  Closed: 'border-slate-300 text-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-300',
}
const when = (t) => (t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—')
const waNumber = (p = '') => { const d = p.replace(/\D/g, ''); return d.length === 10 ? `91${d}` : d }

export default function AdminLeads() {
  const { csrf } = useAdmin()
  const { tripRecords } = useData()
  const tripName = (slug) => tripRecords.find((t) => t.slug === slug)?.name || slug
  const { loading, error, leads, clicks, payments, reload, setLeads } = useServerLeads()
  const [tab, setTab] = useState('all')
  const count = { all: leads.length, clicks: clicks.length, payments: payments.length }
  TABS.forEach((t) => { if (!(t.id in count)) count[t.id] = leads.filter((l) => l.source === t.id).length })

  const setStatus = async (id, status) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
    await adminApi.setLeadStatus(id, status, csrf)
  }

  const exportCSV = () => {
    const day = new Date().toISOString().slice(0, 10)
    if (tab === 'payments') return downloadCSV(`payments-${day}.csv`, payments, ['time', 'event', 'amount', 'trip', 'date', 'people', 'plan', 'name', 'email', 'phone', 'txnid', 'payu_id'].map((k) => ({ label: k, get: (r) => r[k] })))
    if (tab === 'clicks') return downloadCSV(`whatsapp-clicks-${day}.csv`, clicks, ['time', 'button', 'page'].map((k) => ({ label: k, get: (r) => r[k] })))
    const rows = tab === 'all' ? leads : leads.filter((l) => l.source === tab)
    downloadCSV(`leads-${tab}-${day}.csv`, rows, ['time', 'source', 'name', 'phone', 'email', 'enquiry', 'status', 'page'].map((k) => ({ label: k, get: (r) => r[k] })))
  }

  return (
    <Panel
      action={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Lead source" className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-pill bg-slate-100 p-1 dark:bg-slate-900">
            {TABS.map((t) => (
              <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={`shrink-0 whitespace-nowrap rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors ${tab === t.id ? 'bg-white text-sky-dark shadow dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                {t.label} <span className="text-xs opacity-60">({count[t.id]})</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={reload} aria-label="Refresh" className="rounded-pill border border-slate-200 p-2.5 text-slate-500 hover:text-sky-dark dark:border-slate-700"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
            <button type="button" onClick={exportCSV} className="inline-flex items-center gap-2 rounded-pill bg-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-deep-dark"><Download size={16} /> Export CSV</button>
          </div>
        </div>
      }
    >
      {error && <p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {tab === 'payments' ? (
        <Table head={['Customer', 'Trip', 'Amount', 'Result', 'Date', 'Transaction']} empty={!payments.length && <EmptyRow text={loading ? 'Loading…' : 'No checkouts yet. When someone fills in their details at “Book Now”, they appear here — even if they don’t finish paying.'} />}>
          {payments.map((p) => {
            const [label, cls] = RESULT[p.event] || RESULT.initiated
            return (
              <tr key={p.txnid}>
                <Td>
                  <span className="font-semibold">{p.name}</span>
                  <span className="block text-xs text-slate-500">{p.phone}{p.email && ` · ${p.email}`}</span>
                </Td>
                <Td>{tripName(p.trip)}<span className="block text-xs text-slate-500">{/^\d{4}-\d{2}-\d{2}$/.test(p.date) ? fmtDate(p.date) : p.date} · {p.people} pax · {p.plan === 'full' ? 'full payment' : 'advance'}</span></Td>
                <Td className="font-bold">{inr(p.amount)}</Td>
                <Td>
                  <span className="flex items-center gap-2">
                    <span className={`whitespace-nowrap rounded-pill px-2.5 py-1 text-xs font-bold ${cls}`}>{label}</span>
                    {p.event !== 'success' && waNumber(p.phone).length >= 12 && (
                      <a href={`https://wa.me/${waNumber(p.phone)}?text=${encodeURIComponent(`Hi ${p.name}! This is Go Everywhere Trips — we saw you were booking ${tripName(p.trip)} for ${p.date}. Can we help you complete your booking?`)}`}
                        target="_blank" rel="noopener noreferrer" aria-label={`Follow up with ${p.name} on WhatsApp`} title="Follow up on WhatsApp" className="rounded p-1 text-green-600 hover:bg-green-50"><WhatsAppIcon size={15} /></a>
                    )}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-slate-500">{when(p.time)}</Td>
                <Td className="text-xs text-slate-500">{p.txnid}{p.payu_id && <span className="block">PayU {p.payu_id}</span>}</Td>
              </tr>
            )
          })}
        </Table>
      ) : tab === 'clicks' ? (
        <Table head={['When', 'Button', 'Page']} empty={!clicks.length && <EmptyRow text={loading ? 'Loading…' : 'No WhatsApp clicks recorded yet.'} />}>
          {clicks.map((c, i) => (
            <tr key={i}>
              <Td className="whitespace-nowrap">{when(c.time)}</Td>
              <Td>{c.button}</Td>
              <Td className="text-xs text-slate-500 md:max-w-xs md:truncate">{c.page?.replace(/^https?:\/\/[^/]+/, '')}</Td>
            </tr>
          ))}
        </Table>
      ) : (
        <Table head={['Name', 'Phone', 'Email', 'Enquiry', 'Date', 'Status']} empty={!leads.some((l) => tab === 'all' || l.source === tab) && <EmptyRow text={loading ? 'Loading…' : 'No enquiries yet. Popup, custom-trip and contact form submissions appear here (and in your email).'} />}>
          {leads.filter((l) => tab === 'all' || l.source === tab).map((l) => (
            <tr key={l.id}>
              <Td className="whitespace-nowrap font-semibold">
                {l.name}
                {tab === 'all' && <span className="ml-2 rounded-pill bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">{SOURCE[l.source] || l.source}</span>}
              </Td>
              <Td className="whitespace-nowrap">
                <span className="flex items-center gap-1">
                  {l.phone}
                  {waNumber(l.phone).length >= 12 && <>
                    <a href={`https://wa.me/${waNumber(l.phone)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${l.name}`} className="rounded p-1 text-green-600 hover:bg-green-50"><WhatsAppIcon size={14} /></a>
                    <a href={`tel:${l.phone}`} aria-label={`Call ${l.name}`} className="rounded p-1 text-sky-dark hover:bg-sky-light"><Phone size={14} /></a>
                  </>}
                </span>
              </Td>
              <Td className="text-slate-500">{l.email}</Td>
              <Td className="text-slate-600 dark:text-slate-300 md:min-w-[16rem]">{l.enquiry}</Td>
              <Td className="whitespace-nowrap text-slate-500">{when(l.time)}</Td>
              <Td>
                <label htmlFor={`st-${l.id}`} className="sr-only">Status for {l.name}</label>
                <select id={`st-${l.id}`} value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className={`rounded-pill border px-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-brand ${STATUS_CLS[l.status] || STATUS_CLS.New}`}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Td>
            </tr>
          ))}
        </Table>
      )}
      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-700">
        Every enquiry is also emailed to the address in site-config.php and saved on the server in site-logs/. Payments: PayU dashboard has the full record.
      </p>
    </Panel>
  )
}
