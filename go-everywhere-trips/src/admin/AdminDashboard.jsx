import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Map, MessageSquareQuote, Plus, Users } from 'lucide-react'
import { useData } from '../context/DataContext'
import { upcoming } from '../lib/format'
import { Panel, StatusBadge, Table, Td, EmptyRow } from './ui'

const DAY = 864e5
const SOURCE_LABEL = { custom: 'Custom enquiry', contact: 'Contact form', whatsapp: 'WhatsApp click' }

export default function AdminDashboard() {
  const { trips, leads, reviews } = useData()
  const navigate = useNavigate()
  const now = Date.now()
  const inWindow = (from, to) => leads.filter((l) => { const t = new Date(l.date).getTime(); return t > now - from * DAY && t <= now - to * DAY }).length
  const thisWeek = inWindow(7, 0)
  const lastWeek = inWindow(14, 7)
  const leadTrend = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek ? 100 : 0
  const departures = trips.filter((t) => t.status !== 'Draft').flatMap((t) => upcoming(t.departures))

  const stats = [
    { label: 'Total Trips', value: trips.length, sub: `${trips.filter((t) => t.status !== 'Draft').length} live`, Icon: Map, tone: 'bg-sky-brand' },
    { label: 'Active Departures', value: departures.length, sub: `${departures.reduce((s, d) => s + d.seats, 0)} seats open`, Icon: CalendarDays, tone: 'bg-deep' },
    { label: 'New Leads', value: leads.filter((l) => l.status === 'New').length, sub: `${thisWeek} this week`, trend: leadTrend, Icon: Users, tone: 'bg-accent' },
    { label: 'Total Reviews', value: reviews.length, sub: `${(reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1)} ★ average`, Icon: MessageSquareQuote, tone: 'bg-green-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl bg-white p-5 shadow-card dark:bg-slate-800 dark:ring-1 dark:ring-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-1 text-3xl font-black text-deep dark:text-white">{s.value}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${s.tone}`}><s.Icon size={20} aria-hidden="true" /></span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              {s.trend !== undefined && (
                <span className={`inline-flex items-center font-bold ${s.trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {s.trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(s.trend)}%
                </span>
              )}
              {s.sub}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => navigate('/admin/trips?new=1')} className="inline-flex items-center gap-2 rounded-pill bg-sky-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark"><Plus size={16} /> Add Trip</button>
        <button type="button" onClick={() => navigate('/admin/departures?new=1')} className="inline-flex items-center gap-2 rounded-pill bg-deep px-5 py-2.5 text-sm font-bold text-white hover:bg-deep-dark"><Plus size={16} /> Add Departure</button>
      </div>

      <Panel title="Recent Leads" action={<button type="button" onClick={() => navigate('/admin/leads')} className="text-sm font-semibold text-sky-brand hover:underline">View all</button>}>
        <Table head={['Name', 'Source', 'Enquiry', 'Date', 'Status']} empty={!leads.length && <EmptyRow text="No leads yet." />}>
          {leads.slice(0, 10).map((l) => (
            <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <Td className="font-semibold">{l.name}</Td>
              <Td className="text-slate-500">{SOURCE_LABEL[l.source] || l.source}</Td>
              <Td className="max-w-xs truncate text-slate-600 dark:text-slate-300">{l.enquiry}</Td>
              <Td className="whitespace-nowrap text-slate-500">{new Date(l.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Td>
              <Td><StatusBadge status={l.status} /></Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  )
}
