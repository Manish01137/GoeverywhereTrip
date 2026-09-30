import Stars from '../components/ui/Stars'
import { useData } from '../context/DataContext'
import { fmtDate } from '../lib/format'
import { Trash2 } from 'lucide-react'
import { EmptyRow, IconBtn, Panel, Table, Td } from './ui'

export default function AdminReviews() {
  const { reviews, setReviews } = useData()
  const toggle = (id) => setReviews((all) => all.map((r) => (r.id === id ? { ...r, status: r.status === 'Hidden' ? 'Published' : 'Hidden' } : r)))

  return (
    <Panel title={`${reviews.length} reviews · ${reviews.filter((r) => r.status !== 'Hidden').length} shown on site`}>
      <Table head={['Traveller', 'Rating', 'Review', 'Date', 'Visible', '']} empty={!reviews.length && <EmptyRow text="No reviews yet." />}>
        {reviews.map((r) => (
          <tr key={r.id} className="align-top hover:bg-slate-50 dark:hover:bg-slate-700/30">
            <Td><p className="font-semibold">{r.name}</p><p className="text-xs text-slate-500">{r.trip}</p></Td>
            <Td><Stars rating={r.rating} /></Td>
            <Td className="min-w-[18rem] text-slate-600 dark:text-slate-300">{r.review}</Td>
            <Td className="whitespace-nowrap text-slate-500">{r.date ? fmtDate(r.date) : '—'}</Td>
            <Td>
              <button type="button" role="switch" aria-checked={r.status !== 'Hidden'} aria-label={`Show review by ${r.name} on site`} onClick={() => toggle(r.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${r.status !== 'Hidden' ? 'bg-sky-brand' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${r.status !== 'Hidden' ? 'left-[1.375rem]' : 'left-0.5'}`} />
              </button>
            </Td>
            <Td><IconBtn label={`Delete review by ${r.name}`} tone="red" onClick={() => window.confirm('Delete this review?') && setReviews((all) => all.filter((x) => x.id !== r.id))}><Trash2 size={16} /></IconBtn></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}
