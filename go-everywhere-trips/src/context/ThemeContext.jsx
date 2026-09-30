import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }) {
  // index.html sets the class before paint; read it back so there's no flash.
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('get-theme', dark ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }, [dark])

  const toggle = useCallback(() => setDark((d) => !d), [])
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
