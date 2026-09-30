import { createContext, useContext, useState } from 'react'

// Demo-only auth: there is no backend, so anyone reading the bundle can see these.
// Replace with a real auth provider before storing anything sensitive.
export const DEMO_CREDENTIALS = { email: 'admin@get.com', password: 'admin123' }

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => {
    try {
      return localStorage.getItem('get-admin') === 'true'
    } catch {
      return false
    }
  })

  const login = (email, password) => {
    const ok = email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password
    if (ok) {
      localStorage.setItem('get-admin', 'true')
      setIsAuthed(true)
    }
    return ok
  }

  const logout = () => {
    localStorage.removeItem('get-admin')
    setIsAuthed(false)
  }

  return <AdminContext.Provider value={{ isAuthed, login, logout }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
