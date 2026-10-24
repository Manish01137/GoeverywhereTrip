import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, Phone, X } from 'lucide-react'
import { WhatsAppIcon } from '../ui/BrandIcons'
import { useData } from '../../context/DataContext'
import { useFocusTrap } from '../ui/Modal'
import ThemeToggle from '../ui/ThemeToggle'

export const TRIP_MENU = [
  { label: 'Group Tours', to: '/trips?type=Group%20Tour' },
  { label: 'Treks', to: '/trips?type=Trek' },
  { label: 'Customised', to: '/custom-trip' },
  { label: 'Spiritual', to: '/trips?type=Spiritual' },
  { label: 'Weekend', to: '/trips?type=Weekend' },
]

const LINKS = [
  { label: 'Destinations', to: '/#destinations' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blogs' },
  { label: 'Contact', to: '/contact' },
]

function useMediaQuery(q) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [q])
  return match
}

const item = { hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } }

// Brand lockup: the emblem from the logo + the "GO EVERYWHERE — TRIPS" wordmark in the logo's style.
export function Logo({ light = false, className = '' }) {
  const word = light ? 'text-white' : 'text-deep dark:text-white'
  const sun = light ? 'text-sun' : 'text-sun-dark dark:text-sun'
  const rule = light ? 'bg-sun' : 'bg-sun-dark dark:bg-sun'
  return (
    <Link to="/" className={`flex shrink-0 items-center gap-2.5 ${className}`} aria-label="Go Everywhere Trips — home">
      <img src="/brand/logo-circle-128.webp" alt="" width="44" height="44" className={`h-11 w-11 rounded-full shadow-md ring-2 ${light ? 'ring-sun/80' : 'ring-sun ring-offset-2 ring-offset-white dark:ring-offset-slate-900'}`} />
      <span className="leading-none" aria-hidden="true">
        <span className={`block whitespace-nowrap text-[15px] font-black tracking-tight sm:text-[17px] ${word}`}>GO EVERYWHERE</span>
        <span className={`mt-1 flex items-center gap-1.5 text-[10px] font-black tracking-[0.3em] sm:text-[11px] ${sun}`}>
          <span className={`h-[2px] flex-1 rounded ${rule}`} />TRIPS<span className={`h-[2px] flex-1 rounded ${rule}`} />
        </span>
      </span>
    </Link>
  )
}

const linkCls = (overlay) => ({ isActive }) =>
  `relative py-2 text-sm font-semibold transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-sky-brand after:transition-all after:duration-300 hover:text-sky-brand hover:after:w-full ${
    isActive ? 'text-sky-brand after:w-full' : `${overlay ? 'text-white' : 'text-slate-700 dark:text-slate-200'} after:w-0`
  }`

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const wide = useMediaQuery('(min-width: 640px)')
  const { waLink, trackWhatsApp, settings } = useData()
  const { pathname, search } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on navigation.
  useEffect(() => { setOpen(false); setDropdown(false) }, [pathname, search])

  const overlay = false // solid white bar everywhere, like the reference design

  const closeMenu = useCallback(() => setOpen(false), [])
  const menuRef = useFocusTrap(open, closeMenu)

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        overlay ? 'bg-transparent' : scrolled ? 'backdrop-blur-md bg-white/80 shadow-sm dark:bg-slate-900/90' : 'bg-white dark:bg-slate-900'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Logo light={overlay} />

        <ul className="hidden lg:flex items-center gap-8">
          <li className="relative" onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)}>
            <div className="flex items-center">
              <NavLink to="/trips" className={linkCls(overlay)} end>Trips</NavLink>
              <button
                type="button"
                aria-label="Show trip categories"
                aria-expanded={dropdown}
                aria-haspopup="true"
                onClick={() => setDropdown((d) => !d)}
                className={`p-1 hover:text-sky-brand ${overlay ? 'text-white' : 'text-slate-500 dark:text-slate-300'}`}
              >
                <ChevronDown size={16} className={`transition-transform ${dropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <AnimatePresence>
              {dropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full pt-2 w-52"
                >
                  <ul className="rounded-xl bg-white p-2 shadow-hover ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                    {TRIP_MENU.map((m) => (
                      <li key={m.label}>
                        <Link to={m.to} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-light hover:text-sky-dark dark:text-slate-200 dark:hover:bg-slate-700">
                          {m.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          {LINKS.map((l) => (
            <li key={l.label}><NavLink to={l.to} className={l.to.includes('#') ? linkCls(overlay)({ isActive: false }) : linkCls(overlay)}>{l.label}</NavLink></li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href={`tel:+${settings.whatsapp}`} className="mr-2 hidden items-center gap-2.5 xl:flex" aria-label={`Call us at ${settings.phoneDisplay}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Phone size={18} /></span>
            <span className="leading-tight">
              <span className="block text-xs text-slate-500">Call Us</span>
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">{settings.phoneDisplay}</span>
            </span>
          </a>
          <ThemeToggle compact={!wide} />
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp('Navbar button')}
            aria-label="Chat with us on WhatsApp"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <WhatsAppIcon size={20} />
          </a>
          <Link to="/trips" className="hidden sm:inline-flex rounded-pill bg-sky-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-dark transition-colors">
            Book Now
          </Link>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className={`lg:hidden p-2 rounded-full hover:bg-sky-light hover:text-deep dark:hover:bg-slate-800 ${overlay ? 'text-white' : 'text-deep dark:text-white'}`}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Portal: the header's backdrop-blur would otherwise trap this fixed panel inside the 64px bar. */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              ref={menuRef}
              className="fixed inset-0 z-[80] flex h-[100dvh] flex-col bg-white dark:bg-slate-950 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
                <Logo />
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-deep hover:bg-sky-light dark:text-white dark:hover:bg-slate-800">
                  <X size={24} />
                </button>
              </div>
              <motion.div
                className="flex-1 overflow-y-auto overscroll-contain px-5 py-5"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } }}
              >
                <motion.p variants={item} className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Trips</motion.p>
                <motion.div variants={item} className="mb-5 flex flex-wrap gap-2">
                  {[{ label: 'All Trips', to: '/trips' }, ...TRIP_MENU.filter((m) => m.label !== 'Customised')].map((m) => (
                    <Link key={m.label} to={m.to} className="rounded-pill bg-sky-light px-4 py-2 text-sm font-semibold text-sky-dark dark:bg-slate-800 dark:text-sky-300">
                      {m.label}
                    </Link>
                  ))}
                </motion.div>
                <ul>
                  {[{ label: 'Customise Your Trip', to: '/custom-trip' }, ...LINKS].map((l) => (
                    <motion.li key={l.label} variants={item}>
                      <Link to={l.to} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-slate-100 py-3.5 text-lg font-bold text-deep hover:text-sky-brand dark:border-slate-800 dark:text-white">
                        {l.label} <ChevronDown size={18} className="-rotate-90 text-slate-300" aria-hidden="true" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <motion.a variants={item} href={`tel:+${settings.whatsapp}`} className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-brand text-white"><Phone size={18} aria-hidden="true" /></span>
                  <span className="leading-tight"><span className="block text-xs text-slate-500">Call us</span><span className="font-bold text-slate-900 dark:text-white">{settings.phoneDisplay}</span></span>
                </motion.a>
              </motion.div>
              <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-800">
                <a href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp('Mobile menu')} className="flex items-center justify-center gap-2 rounded-pill bg-green-500 py-3 font-bold text-white">
                  <WhatsAppIcon size={18} /> WhatsApp
                </a>
                <Link to="/trips" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-pill bg-sky-brand py-3 font-bold text-white">
                  Book Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  )
}
