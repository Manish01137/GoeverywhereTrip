import { motion } from 'framer-motion'
import { WhatsAppIcon } from '../ui/BrandIcons'
import { useData } from '../../context/DataContext'

export default function WhatsAppFloat() {
  const { waLink, trackWhatsApp } = useData()
  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-deep px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        Chat with us
      </span>
      <motion.span
        className="absolute inset-0 rounded-full bg-green-500"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        aria-hidden="true"
      />
      <motion.a
        href={waLink('Hi! I want to know more about your trips')}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsApp('Floating button')}
        aria-label="Chat with us on WhatsApp"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/40"
      >
        <WhatsAppIcon size={28} />
      </motion.a>
    </div>
  )
}
