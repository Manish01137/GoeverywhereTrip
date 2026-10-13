import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import BackToTop from './BackToTop'
import { clearBootHtml } from '../../lib/prerender'

// Scroll to top on route change, or to the #hash target when present.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(clearBootHtml, []) // the live page has mounted; later lazy loads use the spinner
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 100)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return null
}

// `float={false}` for pages with their own mobile CTA bar (Trip Detail).
export default function PublicLayout({ float = true }) {
  const { pathname } = useLocation()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-sky-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-white">
        Skip to main content
      </a>
      <ScrollManager />
      <Navbar />
      <motion.main id="main" key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-[60vh]">
        <Outlet />
      </motion.main>
      <Footer />
      {!float && <div className="h-14 lg:hidden" aria-hidden="true" />}
      {float && <WhatsAppFloat />}
      <BackToTop raised={!float} />
    </>
  )
}
