import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AdminProvider } from './context/AdminContext'
import { DataProvider } from './context/DataContext'
import './lib/prerender' // must run before React clears #root
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <DataProvider>
          <AdminProvider>
            {/* Respect the OS "reduce motion" setting for all Framer Motion animations */}
            <MotionConfig reducedMotion="user">
              <App />
            </MotionConfig>
          </AdminProvider>
        </DataProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
)
