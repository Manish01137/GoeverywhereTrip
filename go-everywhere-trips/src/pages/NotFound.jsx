import { motion } from 'framer-motion'
import { Compass, Home } from 'lucide-react'
import Seo from '../components/ui/Seo'
import Button from '../components/ui/Button'
import MountainArt from '../components/ui/MountainArt'

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-light to-sky-xlight px-4 dark:from-slate-900 dark:to-slate-950">
      <Seo title="Page not found" noindex />
      <div className="text-center">
        <MountainArt className="mx-auto w-72 md:w-96" float />
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-4xl font-black text-deep md:text-5xl dark:text-white">
          <span className="text-gradient">404</span> — Lost in the Mountains?
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
          The trail you’re looking for doesn’t exist — but plenty of others do.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" size="lg"><Home size={18} /> Go Back Home</Button>
          <Button to="/trips" variant="ghost" size="lg"><Compass size={18} /> Explore Trips</Button>
        </motion.div>
      </div>
    </main>
  )
}
