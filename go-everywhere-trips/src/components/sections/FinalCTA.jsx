import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { WhatsAppIcon } from '../ui/BrandIcons'
import { useData } from '../../context/DataContext'

export default function FinalCTA() {
  const { waLink, trackWhatsApp } = useData()
  return (
    <section className="container-x pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative overflow-hidden rounded-3xl bg-deep px-6 py-16 text-center md:px-16"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.15) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-brand/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <p className="relative text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Your next story starts here</p>
        <h2 className="relative mx-auto mt-3 max-w-2xl text-3xl font-black text-white md:text-5xl">
          Ready to Go Everywhere?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-sky-100/90">
          Tell us where you want to go — we’ll plan the route, the stays and the people. You just show up.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/trips" size="lg">Browse Trips</Button>
          <Button to="/custom-trip" variant="white" size="lg">Plan Custom Trip</Button>
          <Button href={waLink('Hi! Help me plan my next trip')} variant="whatsapp" size="lg" onClick={() => trackWhatsApp('Final CTA')}>
            <WhatsAppIcon size={18} /> WhatsApp Us
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
