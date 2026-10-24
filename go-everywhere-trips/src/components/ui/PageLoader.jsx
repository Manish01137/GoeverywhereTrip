import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { wasPrerendered } from '../../lib/prerender'

// Branded splash shown for 800ms on first app load only — skipped when the page arrived
// prerendered, because its content is already visible (and hiding it would hurt LCP).
export default function PageLoader() {
  const [show, setShow] = useState(!wasPrerendered)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-sky-xlight dark:bg-slate-950"
          role="status"
          aria-label="Loading Go Everywhere Trips"
        >
          <div className="text-center">
            <img src="/brand/logo-full-360.webp" alt="" width="360" height="230" className="mx-auto mb-1 h-auto w-56 rounded-2xl shadow-hover" />
            <div className="mt-5 mx-auto h-1.5 w-48 overflow-hidden rounded-pill bg-sky-light dark:bg-slate-800">
              <div className="h-full rounded-pill bg-sky-brand animate-loader-bar" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
