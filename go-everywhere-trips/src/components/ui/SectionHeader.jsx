import { motion } from 'framer-motion'

export default function SectionHeader({ eyebrow, title, subtitle, centered = false, light = false, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`mb-10 ${centered ? 'text-center mx-auto max-w-2xl' : ''} ${className}`}
    >
      {eyebrow && (
        <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 ${light ? 'text-sky-300' : 'text-sky-brand'}`}>{eyebrow}</p>
      )}
      {centered ? (
        <h2 className={`text-3xl md:text-4xl font-bold ${light ? 'text-white' : 'text-deep dark:text-white'}`}>
          {title}
          <span className="block mx-auto mt-3 h-1.5 w-12 rounded-pill bg-sky-brand" aria-hidden="true" />
        </h2>
      ) : (
        <h2 className={`text-3xl md:text-4xl font-bold border-l-4 border-sky-brand pl-4 ${light ? 'text-white' : 'text-deep dark:text-white'}`}>
          {title}
        </h2>
      )}
      {subtitle && <p className={`mt-3 ${centered ? '' : 'pl-5'} ${light ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>{subtitle}</p>}
    </motion.div>
  )
}
