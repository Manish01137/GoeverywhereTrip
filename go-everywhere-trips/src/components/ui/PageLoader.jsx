import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Branded splash shown for 800ms on first app load only.
export default function PageLoader() {
  const [show, setShow] = useState(true)
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
            <div className="text-5xl mb-3" aria-hidden="true">🏔️</div>
            <div className="text-2xl font-extrabold text-deep dark:text-white">
              Go Everywhere <span className="text-sky-brand">Trips</span>
            </div>
            <div className="mt-5 mx-auto h-1.5 w-48 overflow-hidden rounded-pill bg-sky-light dark:bg-slate-800">
              <div className="h-full rounded-pill bg-sky-brand animate-loader-bar" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
