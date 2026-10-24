import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const HINT_KEY = 'get-theme-hint-seen'

// Eye-catching day/night switch: sky with clouds ↔ night with stars, sun ↔ moon knob,
// a soft glow pulse to draw attention, and a one-time "Try dark mode" hint.
export default function ThemeToggle({ compact = false, hint = true }) {
  const { dark, toggle } = useTheme()
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (!hint) return
    try { if (localStorage.getItem(HINT_KEY)) return } catch { return }
    const show = setTimeout(() => setShowHint(true), 2500)
    const hide = setTimeout(() => setShowHint(false), 9000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [hint])

  const onClick = () => {
    toggle()
    setShowHint(false)
    try { localStorage.setItem(HINT_KEY, '1') } catch { /* ignore */ }
  }

  const w = compact ? 'w-[52px] h-7' : 'w-16 h-8'
  const knob = compact ? 'h-[22px] w-[22px]' : 'h-6 w-6'
  const travel = compact ? 22 : 32

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={onClick}
        role="switch"
        aria-checked={dark}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        whileTap={{ scale: 0.92 }}
        // Gentle attention pulse (3 times) so visitors notice the switch.
        animate={{ boxShadow: dark
          ? ['0 0 0 0 rgba(129,140,248,0)', '0 0 0 6px rgba(129,140,248,0.35)', '0 0 0 0 rgba(129,140,248,0)']
          : ['0 0 0 0 rgba(254,214,3,0)', '0 0 0 6px rgba(254,214,3,0.45)', '0 0 0 0 rgba(254,214,3,0)'] }}
        transition={{ duration: 1.6, repeat: 2, delay: 1.2 }}
        className={`relative ${w} shrink-0 overflow-hidden rounded-full border-2 transition-colors duration-500 ${dark ? 'border-indigo-400/60 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800' : 'border-sky-300 bg-gradient-to-br from-sky-300 via-sky-400 to-sky-500'}`}
      >
        {/* Scenery */}
        <AnimatePresence initial={false}>
          {dark ? (
            <motion.span key="stars" className="absolute inset-0" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.4 }} aria-hidden="true">
              {[[18, 30], [30, 62], [52, 40], [40, 20], [64, 70]].map(([l, t], i) => (
                <motion.span key={i} className="absolute h-[3px] w-[3px] rounded-full bg-white" style={{ left: `${l}%`, top: `${t}%` }}
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }} />
              ))}
            </motion.span>
          ) : (
            <motion.span key="clouds" className="absolute inset-0" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }} aria-hidden="true">
              <span className="absolute right-[14%] top-[22%] h-2 w-4 rounded-full bg-white/90" />
              <span className="absolute right-[30%] top-[58%] h-1.5 w-3 rounded-full bg-white/70" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Knob: sun ↔ moon */}
        <motion.span
          className={`absolute left-[2px] top-1/2 flex ${knob} ${compact ? '-mt-[11px]' : '-mt-3'} items-center justify-center rounded-full shadow-md`}
          animate={{ x: dark ? travel : 0, rotate: dark ? 360 : 0, backgroundColor: dark ? '#E2E8F0' : '#FED603' }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          aria-hidden="true"
        >
          {dark ? (
            <>
              <span className="absolute left-[30%] top-[28%] h-1.5 w-1.5 rounded-full bg-slate-400/70" />
              <span className="absolute bottom-[26%] right-[28%] h-1 w-1 rounded-full bg-slate-400/70" />
            </>
          ) : (
            <motion.span className="absolute inset-[-3px] rounded-full border-2 border-dashed border-yellow-200/90" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
          )}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {showHint && (
          <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="absolute right-1/2 top-full z-50 mt-3 translate-x-1/2 whitespace-nowrap rounded-xl bg-deep px-3 py-2 text-xs font-bold text-white shadow-xl"
          >
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-deep" aria-hidden="true" />
            <span className="relative">{dark ? '☀️ Try light mode' : '🌙 Try dark mode'}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
