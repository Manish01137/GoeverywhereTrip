import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { CalendarDays, ExternalLink, FileText, LayoutDashboard, LogOut, Map, Menu, MessageSquareQuote, Moon, Settings, Sun, Users, X } from 'lucide-react'
import Seo from '../components/ui/Seo'
import { Logo } from '../components/layout/Navbar'
import { useAdmin } from '../context/AdminContext'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import AdminDashboard from './AdminDashboard'
import AdminTrips from './AdminTrips'
import AdminDepartures from './AdminDepartures'
import AdminLeads from './AdminLeads'
import AdminBlogs from './AdminBlogs'
import AdminReviews from './AdminReviews'
import AdminSettings from './AdminSettings'

const NAV = [
  { to: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, el: <AdminDashboard /> },
  { to: 'trips', label: 'Trips', Icon: Map, el: <AdminTrips /> },
  { to: 'departures', label: 'Departures', Icon: CalendarDays, el: <AdminDepartures /> },
  { to: 'leads', label: 'Leads', Icon: Users, el: <AdminLeads /> },
  { to: 'blogs', label: 'Blogs', Icon: FileText, el: <AdminBlogs /> },
  { to: 'reviews', label: 'Reviews', Icon: MessageSquareQuote, el: <AdminReviews /> },
  { to: 'settings', label: 'Settings', Icon: Settings, el: <AdminSettings /> },
]

export default function AdminLayout() {
  const { isAuthed, logout } = useAdmin()
  const { dark, toggle } = useTheme()
  const { leads } = useData()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  if (!isAuthed) return <Navigate to="/admin/login" replace />

  const current = NAV.find((n) => pathname.startsWith(`/admin/${n.to}`)) || NAV[0]
  const newLeads = leads.filter((l) => l.status === 'New').length

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col bg-deep text-sky-100">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo light className="whitespace-nowrap text-base" />
        <button type="button" onClick={() => setOpen(false)} aria-label="Close sidebar" className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden"><X size={20} /></button>
      </div>
      <ul className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink to={`/admin/${to}`} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-sky-brand text-white shadow-lg shadow-sky-brand/30' : 'hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {to === 'leads' && newLeads > 0 && <span className="rounded-pill bg-accent px-2 text-xs text-white">{newLeads}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 p-3">
        <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-white/10"><ExternalLink size={18} /> View website</Link>
      </div>
    </nav>
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Seo title={`${current.label} · Admin`} noindex />
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-slate-900/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.aside className="absolute inset-y-0 left-0 w-64" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open sidebar" className="rounded-lg p-2 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"><Menu size={22} /></button>
            <h1 className="text-lg font-bold text-deep dark:text-white">{current.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-pill border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-300">
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main id="main" className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              {NAV.map((n) => <Route key={n.to} path={n.to} element={n.el} />)}
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
