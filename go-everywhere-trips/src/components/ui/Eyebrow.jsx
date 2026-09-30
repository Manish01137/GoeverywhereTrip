import { Reveal } from './Reveal'

// Centered "E Y E B R O W / Title" heading used by the homepage sections.
export default function Eyebrow({ eyebrow, title, children, className = '' }) {
  return (
    <Reveal y={24} className={`mb-10 text-center ${className}`}>
      <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">{title}</h2>
      {children}
    </Reveal>
  )
}
