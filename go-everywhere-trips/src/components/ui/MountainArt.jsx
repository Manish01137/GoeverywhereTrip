import { motion } from 'framer-motion'

// Inline mountain illustration used for empty states and the 404 page.
export default function MountainArt({ className = 'w-64', float = false }) {
  return (
    <motion.svg
      viewBox="0 0 240 160"
      className={className}
      aria-hidden="true"
      animate={float ? { y: [0, -10, 0] } : undefined}
      transition={float ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <circle cx="185" cy="38" r="16" className="fill-accent/80" />
      <path d="M10 140 L80 50 L115 95 L140 70 L230 140 Z" className="fill-sky-light stroke-sky-brand dark:fill-slate-800" strokeWidth="3" strokeLinejoin="round" />
      <path d="M80 50 L66 68 L76 64 L84 72 L92 60 Z" className="fill-white stroke-sky-brand" strokeWidth="2" strokeLinejoin="round" />
      <path d="M140 70 L130 82 L140 78 L148 84 Z" className="fill-white stroke-sky-brand" strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 140 C 70 120, 90 135, 120 118 S 170 128, 200 140" className="stroke-deep dark:stroke-sky-300" strokeWidth="2.5" strokeDasharray="6 6" fill="none" />
      <path d="M60 30 q6 -6 12 0 q6 -6 12 0" className="stroke-slate-400" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="10" y1="140" x2="230" y2="140" className="stroke-deep dark:stroke-slate-500" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  )
}
