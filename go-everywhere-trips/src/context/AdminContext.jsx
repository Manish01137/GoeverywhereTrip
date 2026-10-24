import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { adminApi } from '../lib/api'

// Real server-side admin session (api/admin.php). Credentials live in site-config.php on the server.
const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [state, setState] = useState({ checked: false, isAuthed: false, csrf: null, email: null, configured: true, serverDown: false })

  const refresh = useCallback(async () => {
    const r = await adminApi.me()
    setState({ checked: true, isAuthed: !!r.admin, csrf: r.csrf || null, email: r.email || null, configured: r.configured !== false, serverDown: !r.ok })
  }, [])

  useEffect(() => {
    // Only ask the server when someone is actually in the admin area.
    if (window.location.pathname.startsWith('/admin')) refresh()
    else setState((s) => ({ ...s, checked: false }))
  }, [refresh])

  const login = async (email, password) => {
    const r = await adminApi.login(email, password)
    if (r.ok) setState({ checked: true, isAuthed: true, csrf: r.csrf, email: r.email, configured: true, serverDown: false })
    return r
  }

  const logout = async () => {
    await adminApi.logout()
    setState((s) => ({ ...s, isAuthed: false, csrf: null }))
  }

  return <AdminContext.Provider value={{ ...state, refresh, login, logout }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
