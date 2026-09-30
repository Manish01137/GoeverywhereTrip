import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, Moon, Phone, Sun, X } from 'lucide-react'
import { WhatsAppIcon } from '../ui/BrandIcons'
import { useTheme } from '../../context/ThemeContext'
import { useData } from '../../context/DataContext'
import { useFocusTrap } from '../ui/Modal'

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

export function Logo({ light = false, className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-extrabold text-xl tracking-tight ${className}`} aria-label="Go Everywhere Trips — home">
      <span aria-hidden="true">🏔️</span>
      <span className={light ? 'text-white' : 'text-deep dark:text-white'}>Go Everywhere</span>
      <span className="text-sky-brand">Trips</span>
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
  const { dark, toggle } = useTheme()
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
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2 rounded-full hover:bg-sky-light hover:text-sky-dark dark:hover:bg-slate-800 ${overlay ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            ref={menuRef}
            className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 rounded-full hover:bg-sky-light dark:hover:bg-slate-800">
                <X size={24} />
              </button>
            </div>
            <motion.ul
              className="flex-1 overflow-y-auto px-6 py-6 space-y-1"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
              {[{ label: 'All Trips', to: '/trips' }, ...TRIP_MENU, ...LINKS].map((l) => (
                <motion.li key={l.label} variants={{ hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0 } }}>
                  <Link to={l.to} onClick={() => setOpen(false)} className="block py-3 text-xl font-bold text-deep border-b border-slate-100 hover:text-sky-brand dark:text-white dark:border-slate-800">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="grid grid-cols-2 gap-3 p-4 border-t border-slate-100 dark:border-slate-800">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsApp('Mobile menu')} className="flex items-center justify-center gap-2 rounded-pill bg-green-500 py-3 font-bold text-white">
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
              <Link to="/trips" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-pill bg-sky-brand py-3 font-bold text-white">
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
