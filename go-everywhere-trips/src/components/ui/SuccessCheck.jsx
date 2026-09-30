import { motion } from 'framer-motion'

// Animated drawn checkmark for form success states.
export default function SuccessCheck({ title, message, children }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center" role="status">
      <motion.svg viewBox="0 0 52 52" className="h-24 w-24" initial="hidden" animate="show">
        <motion.circle cx="26" cy="26" r="24" fill="none" strokeWidth="3" className="stroke-green-500"
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.6 } } }} />
        <motion.path d="M15 27 l7 7 l15 -16" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="stroke-green-500"
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.4, delay: 0.55 } } }} />
      </motion.svg>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-5 text-2xl font-bold text-deep dark:text-white">{title}</motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">{message}</motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-6">{children}</motion.div>
    </motion.div>
  )
}
