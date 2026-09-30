// Small building blocks shared by admin pages.
export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white shadow-card dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-slate-700 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          {title && <h2 className="font-bold text-deep dark:text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Table({ head, children, empty }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-5 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">{children}</tbody>
      </table>
      {empty}
    </div>
  )
}

export const Td = ({ className = '', children }) => <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>

const STATUS = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  Published: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  Converted: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  Draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  Hidden: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  New: 'bg-sky-light text-sky-dark dark:bg-sky-500/15 dark:text-sky-300',
  Contacted: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
}
export const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-pill px-2.5 py-1 text-xs font-bold ${STATUS[status] || STATUS.Draft}`}>{status}</span>
)

export function IconBtn({ label, onClick, href, tone = 'sky', children }) {
  const cls = `inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
    tone === 'red' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-slate-500 hover:bg-sky-light hover:text-sky-dark dark:hover:bg-slate-700'
  }`
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={cls}>{children}</a>
  return <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>{children}</button>
}

export function EmptyRow({ text }) {
  return <p className="px-5 py-10 text-center text-sm text-slate-500">{text}</p>
}
