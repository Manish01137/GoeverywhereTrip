import { useState } from 'react'
import { Download, Phone, Trash2 } from 'lucide-react'
import { WhatsAppIcon } from '../components/ui/BrandIcons'
import { useData } from '../context/DataContext'
import { downloadCSV } from './csv'
import { EmptyRow, IconBtn, Panel, Table, Td } from './ui'

const TABS = [
  { id: 'custom', label: 'Custom Enquiries' },
  { id: 'contact', label: 'Contact Form' },
  { id: 'whatsapp', label: 'WhatsApp Clicks' },
]
const STATUSES = ['New', 'Contacted', 'Converted']
const STATUS_CLS = {
  New: 'border-sky-brand text-sky-dark bg-sky-light dark:bg-sky-500/15 dark:text-sky-300',
  Contacted: 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-500/15 dark:text-orange-300',
  Converted: 'border-green-300 text-green-700 bg-green-50 dark:bg-green-500/15 dark:text-green-300',
}

export default function AdminLeads() {
  const { leads, setLeads, settings } = useData()
  const [tab, setTab] = useState('custom')
  const rows = leads.filter((l) => l.source === tab)

  const setStatus = (id, status) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
  const remove = (id) => window.confirm('Delete this lead?') && setLeads((ls) => ls.filter((l) => l.id !== id))
  const digits = (p) => p.replace(/\D/g, '').replace(/^(?!91)(\d{10})$/, '91$1')

  const exportCSV = () =>
    downloadCSV(`get-leads-${tab}-${new Date().toISOString().slice(0, 10)}.csv`, rows, [
      { label: 'Name', get: (l) => l.name },
      { label: 'Phone', get: (l) => l.phone },
      { label: 'Email', get: (l) => l.email },
      { label: 'Enquiry', get: (l) => l.enquiry },
      { label: 'Date', get: (l) => new Date(l.date).toLocaleString('en-IN') },
      { label: 'Status', get: (l) => l.status },
    ])

  return (
    <Panel
      action={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Lead source" className="flex flex-wrap gap-1 rounded-pill bg-slate-100 p-1 dark:bg-slate-900">
            {TABS.map((t) => {
              const n = leads.filter((l) => l.source === t.id).length
              return (
                <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                  className={`rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors ${tab === t.id ? 'bg-white text-sky-dark shadow dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                  {t.label} <span className="text-xs opacity-60">({n})</span>
                </button>
              )
            })}
          </div>
          <button type="button" onClick={exportCSV} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-pill bg-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-deep-dark disabled:opacity-50">
            <Download size={16} /> Export CSV
          </button>
        </div>
      }
    >
      <Table head={['Name', 'Phone', 'Email', 'Enquiry', 'Date', 'Status', '']} empty={!rows.length && <EmptyRow text="No leads in this tab yet. Form submissions on the website appear here." />}>
        {rows.map((l) => (
          <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <Td className="whitespace-nowrap font-semibold">{l.name}</Td>
            <Td className="whitespace-nowrap">
              {/\d{10}/.test(l.phone.replace(/\D/g, '')) ? (
                <span className="flex items-center gap-1">
                  {l.phone}
                  <a href={`https://wa.me/${digits(l.phone)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${l.name}`} className="rounded p-1 text-green-600 hover:bg-green-50"><WhatsAppIcon size={14} /></a>
                  <a href={`tel:${l.phone}`} aria-label={`Call ${l.name}`} className="rounded p-1 text-sky-dark hover:bg-sky-light"><Phone size={14} /></a>
                </span>
              ) : l.phone}
            </Td>
            <Td className="text-slate-500">{l.email}</Td>
            <Td className="min-w-[16rem] text-slate-600 dark:text-slate-300">{l.enquiry}</Td>
            <Td className="whitespace-nowrap text-slate-500">{new Date(l.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</Td>
            <Td>
              <label htmlFor={`st-${l.id}`} className="sr-only">Status for {l.name}</label>
              <select id={`st-${l.id}`} value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className={`rounded-pill border px-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-brand ${STATUS_CLS[l.status]}`}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Td>
            <Td><IconBtn label="Delete lead" tone="red" onClick={() => remove(l.id)}><Trash2 size={16} /></IconBtn></Td>
          </tr>
        ))}
      </Table>
      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-700">
        Demo mode: leads are stored in this browser only. Connect a backend or form service to receive them from every visitor. Business WhatsApp: +{settings.whatsapp}
      </p>
    </Panel>
  )
}
