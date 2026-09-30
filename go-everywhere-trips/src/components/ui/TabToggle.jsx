import { motion } from 'framer-motion'

// Segmented pill toggle with a sliding active background.
export default function TabToggle({ id, tabs, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-pill bg-white p-1.5 shadow-[0_6px_24px_rgba(14,165,233,0.18)] dark:bg-slate-800 ${className}`}>
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          type="button"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={`relative shrink-0 rounded-pill px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${value === t ? 'text-white' : 'text-slate-700 hover:text-sky-dark dark:text-slate-200'}`}
        >
          {value === t && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-pill bg-sky-brand shadow-md shadow-sky-brand/40" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className="relative">{t}</span>
        </button>
      ))}
    </div>
  )
}
