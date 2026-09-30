const TONES = {
  sky: 'bg-sky-light text-sky-dark dark:bg-sky-500/15 dark:text-sky-300',
  brand: 'bg-sky-brand text-white',
  accent: 'bg-accent text-white',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  white: 'bg-white/90 text-deep',
}

export default function Badge({ tone = 'sky', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-pill ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}
