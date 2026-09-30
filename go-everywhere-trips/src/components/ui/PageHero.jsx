import { motion } from 'framer-motion'

export default function PageHero({ image, eyebrow, title, subtitle, tall = false, children }) {
  return (
    <section
      className={`relative flex items-center ${tall ? 'min-h-[60vh]' : 'min-h-[38vh]'} py-16`}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(12,74,110,0.75), rgba(12,74,110,0.55) 50%, rgba(8,51,68,0.9)), url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <motion.div className="container-x text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">{eyebrow}</p>}
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-sky-100/90">{subtitle}</p>}
        {children}
      </motion.div>
    </section>
  )
}
