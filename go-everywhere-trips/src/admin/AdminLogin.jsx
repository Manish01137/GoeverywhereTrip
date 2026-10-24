import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import Seo from '../components/ui/Seo'
import { useAdmin } from '../context/AdminContext'

export default function AdminLogin() {
  const { checked, isAuthed, configured, serverDown, refresh, login } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (!checked) refresh() }, [checked, refresh])
  if (isAuthed) return <Navigate to="/admin/dashboard" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const r = await login(email, password)
    setBusy(false)
    if (r.ok) navigate('/admin/dashboard', { replace: true })
    else setError(r.error || 'Could not sign in')
  }

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-sky-xlight p-4 dark:bg-slate-950">
      <Seo title="Admin Login" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-hover dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
        <div className="bg-deep px-8 py-6 text-center">
          <img src="/brand/logo-full-360.webp" alt="Go Everywhere Trips" width="360" height="230" className="mx-auto h-auto w-48" />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-sky-100/80"><Lock size={14} /> Admin panel</p>
        </div>
        <form onSubmit={submit} className="space-y-5 p-8">
          {checked && serverDown && (
            <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Can’t reach the server. On your computer, run <code>npm run php</code> alongside <code>npm run dev</code>.</p>
          )}
          {checked && !serverDown && !configured && (
            <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Admin login isn’t set up yet — add <code>admin_email</code> and <code>admin_password</code> to <code>site-config.php</code> on the server.</p>
          )}
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
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-pill bg-sky-brand py-3 font-bold text-white hover:bg-sky-dark disabled:opacity-70">
            {busy && <Loader2 size={18} className="animate-spin" />} Sign In
          </motion.button>
        </form>
      </motion.div>
    </main>
  )
}
