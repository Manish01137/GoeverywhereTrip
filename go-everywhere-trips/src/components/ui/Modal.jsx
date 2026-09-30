import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Accessible dialog: focus trap, Esc to close, restores focus on close, locks body scroll.
export function useFocusTrap(open, onClose) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    const node = ref.current
    const first = node?.querySelectorAll(FOCUSABLE)[0]
    ;(first || node)?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const [a, z] = [items[0], items[items.length - 1]]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prev?.focus?.()
    }
  }, [open, onClose])
  return ref
}

// variant: 'drawer' slides in from the right, 'sheet' from the bottom, 'center' scales in.
export default function Modal({ open, onClose, title, variant = 'center', children, footer, wide = false }) {
  const ref = useFocusTrap(open, onClose)
  const panel = {
    drawer: { cls: `fixed inset-y-0 right-0 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`, from: { x: '100%' }, to: { x: 0 } },
    sheet: { cls: 'fixed inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl', from: { y: '100%' }, to: { y: 0 } },
    center: { cls: `relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl max-h-[90vh]`, from: { opacity: 0, scale: 0.95 }, to: { opacity: 1, scale: 1 } },
  }[variant]

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-[70] ${variant === 'center' ? 'flex items-center justify-center p-4' : ''}`}>
          <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={panel.from}
            animate={panel.to}
            exit={panel.from}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`${panel.cls} bg-white dark:bg-slate-900 shadow-2xl flex flex-col focus:outline-none`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-deep dark:text-white">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close dialog" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
