import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock } from 'lucide-react'
import Seo from '../components/ui/Seo'
import { Logo } from '../components/layout/Navbar'
import { DEMO_CREDENTIALS, useAdmin } from '../context/AdminContext'

export default function AdminLogin() {
  const { isAuthed, login } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  if (isAuthed) return <Navigate to="/admin/dashboard" replace />

  const submit = (e) => {
    e.preventDefault()
    if (login(email, password)) navigate('/admin/dashboard', { replace: true })
    else setError('Incorrect email or password')
  }

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-sky-xlight p-4 dark:bg-slate-950">
      <Seo title="Admin Login" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-hover dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
        <div className="bg-deep px-8 py-6">
          <Logo light />
          <p className="mt-2 flex items-center gap-1.5 text-sm text-sky-100/80"><Lock size={14} /> Admin panel</p>
        </div>
        <form onSubmit={submit} className="space-y-5 p-8">
          <div>
            <label htmlFor="admin-email" className="label">Email</label>
            <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} className="input" required />
          </div>
          <div>
            <label htmlFor="admin-password" className="label">Password</label>
            <div className="relative">
              <input id="admin-password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} className="input pr-11" required />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-dark">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:bg-red-500/10">{error}</p>}
          <motion.button whileTap={{ scale: 0.97 }} type="submit" className="w-full rounded-pill bg-sky-brand py-3 font-bold text-white hover:bg-sky-dark">Sign In</motion.button>
          <div className="rounded-xl border border-dashed border-sky-brand/50 bg-sky-xlight p-4 text-sm dark:bg-slate-800">
            <p className="font-semibold text-deep dark:text-white">Demo credentials</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}</p>
            <button type="button" onClick={() => { setEmail(DEMO_CREDENTIALS.email); setPassword(DEMO_CREDENTIALS.password) }} className="mt-2 text-xs font-bold text-sky-brand hover:underline">Fill for me</button>
          </div>
        </form>
      </motion.div>
    </main>
  )
}
