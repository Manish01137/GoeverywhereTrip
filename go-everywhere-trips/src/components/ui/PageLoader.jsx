import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// "Summit Sunrise" intro: mountains draw themselves, the sun rises, a hiker climbs the trail
// and plants a flag, the logo pops in — then the screen closes into a circle to reveal the site.
// Plays once per visit (browser session); skipped for crawlers.

const SEEN = 'get-intro-seen'
const DURATION = 2500
const RIDGE_BACK = 'M0 150 L40 112 L72 132 L112 88 L150 120 L196 70 L236 112 L268 92 L300 118 L300 180 L0 180 Z'
const MOUNTAIN = 'M28 180 L118 66 L146 98 L170 80 L272 180 Z'
const SNOW = 'M118 66 L98 92 L112 86 L122 98 L134 84 Z M170 80 L158 96 L168 92 L178 100 L184 92 Z'
const TRAIL = 'M64 178 C 92 168, 76 152, 98 142 S 94 116, 108 104 S 116 84, 118 70'
const STARS = [[24, 22], [60, 12], [92, 30], [140, 14], [230, 20], [262, 40], [284, 14], [40, 52], [208, 44], [250, 64]]
const LINES = ['Packing your backpack…', 'Checking the weather…', 'Reaching the summit…']
const WORD = 'GO EVERYWHERE'

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function shouldPlay() {
  if (typeof navigator !== 'undefined' && navigator.webdriver) return false
  try { return sessionStorage.getItem(SEEN) !== '1' } catch { return true }
}

export default function PageLoader() {
  const [show, setShow] = useState(shouldPlay)
  const [line, setLine] = useState(0)

  useEffect(() => {
    if (!show) return
    try { sessionStorage.setItem(SEEN, '1') } catch { /* ignore */ }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const done = setTimeout(() => setShow(false), reduced() ? 700 : DURATION)
    const cycle = setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), 750)
    return () => { clearTimeout(done); clearInterval(cycle); document.body.style.overflow = prev }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Loading Go Everywhere Trips"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-b from-deep-dark via-deep to-[#0B5BA8]"
          initial={{ clipPath: 'circle(150% at 50% 42%)' }}
          animate={{ clipPath: 'circle(150% at 50% 42%)' }}
          exit={{ clipPath: 'circle(0% at 50% 42%)', transition: { duration: 0.75, ease: [0.7, 0, 0.3, 1] } }}
          onClick={() => setShow(false)}
        >
          <div className="flex flex-col items-center">
            {/* Scene — fixed 300×180 so the SVG path coordinates map 1:1 */}
            <div className="relative h-[180px] w-[300px] origin-bottom scale-90 sm:scale-110">
              <svg viewBox="0 0 300 180" width="300" height="180" className="absolute inset-0 overflow-visible" aria-hidden="true">
                <defs>
                  <radialGradient id="sunGlow">
                    <stop offset="0%" stopColor="#FED603" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#FED603" stopOpacity="0" />
                  </radialGradient>
                  <clipPath id="horizon"><rect x="0" y="0" width="300" height="150" /></clipPath>
                </defs>

                {STARS.map(([x, y], i) => (
                  <motion.circle key={i} cx={x} cy={y} r={i % 3 ? 1 : 1.5} fill="white"
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.4, 1] }} transition={{ duration: 1.6, delay: 0.05 * i }} />
                ))}

                {/* Sun rising behind the range */}
                <g clipPath="url(#horizon)">
                  <motion.g initial={{ y: 70 }} animate={{ y: 0 }} transition={{ duration: 1.2, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}>
                    <motion.circle cx="168" cy="84" r="56" fill="url(#sunGlow)" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ transformOrigin: '168px 84px' }} />
                    <circle cx="168" cy="84" r="30" fill="#FED603" />
                  </motion.g>
                </g>

                {/* Back ridge */}
                <motion.path d={RIDGE_BACK} fill="#0B5BA8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
                  initial={{ pathLength: 0, fillOpacity: 0 }} animate={{ pathLength: 1, fillOpacity: 1 }}
                  transition={{ pathLength: { duration: 0.9, delay: 0.1 }, fillOpacity: { duration: 0.5, delay: 0.7 } }} />

                {/* Main mountain: outline draws, then fills with snow-white */}
                <motion.path d={MOUNTAIN} fill="#ffffff" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round"
                  initial={{ pathLength: 0, fillOpacity: 0 }} animate={{ pathLength: 1, fillOpacity: 1 }}
                  transition={{ pathLength: { duration: 0.9, delay: 0.2, ease: 'easeInOut' }, fillOpacity: { duration: 0.5, delay: 0.85 } }} />
                <motion.path d={SNOW} fill="#024480" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 1, duration: 0.4 }} />

                {/* Trail + hiker */}
                <motion.path d={TRAIL} fill="none" stroke="#024480" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 6"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, delay: 0.7 }} />
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
                  <circle r="4.5" fill="#F97316" stroke="#fff" strokeWidth="1.5">
                    <animateMotion dur="1.25s" begin="0.75s" fill="freeze" path={TRAIL} calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
                  </circle>
                </motion.g>

                {/* Summit flag */}
                <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 2.0 }} style={{ transformOrigin: '118px 66px' }}>
                  <line x1="118" y1="66" x2="118" y2="44" stroke="#024480" strokeWidth="2" />
                  <motion.path d="M118 44 L136 49 L118 55 Z" fill="#FED603" animate={{ skewY: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 2.2 }} style={{ transformOrigin: '118px 49px' }} />
                </motion.g>
              </svg>
            </div>

            {/* Logo + wordmark */}
            <motion.img
              src="/brand/logo-circle-128.webp" alt="" width="64" height="64"
              className="-mt-2 h-16 w-16 rounded-full shadow-xl ring-4 ring-sun"
              initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.9 }}
            />
            <div className="mt-3 flex" aria-hidden="true">
              {WORD.split('').map((ch, i) => (
                <motion.span key={i} className="text-2xl font-black tracking-tight text-white sm:text-3xl"
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 + i * 0.035, type: 'spring', stiffness: 400, damping: 20 }}>
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </div>
            <div className="mt-1 flex w-48 items-center gap-2 sm:w-56" aria-hidden="true">
              <motion.span className="h-[2px] flex-1 origin-right rounded bg-sun" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.5, duration: 0.4 }} />
              <motion.span className="text-sm font-black tracking-[0.35em] text-sun" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.55 }}>TRIPS</motion.span>
              <motion.span className="h-[2px] flex-1 origin-left rounded bg-sun" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.5, duration: 0.4 }} />
            </div>

            <div className="mt-6 h-5 overflow-hidden text-center text-xs font-semibold tracking-wide text-sky-100/80">
              <AnimatePresence mode="wait">
                <motion.p key={line} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }}>
                  {LINES[line]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
