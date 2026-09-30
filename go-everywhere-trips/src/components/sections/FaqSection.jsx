import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Eyebrow from '../ui/Eyebrow'

const FAQS = [
  { q: 'Who travels with Go Everywhere Trips?', a: 'Mostly solo travellers, friends and couples aged 20–40 — students, working professionals and first-time trekkers. Around 45% of our travellers are women and many of them travel solo.' },
  { q: 'Where do your trips start?', a: 'Most Uttarakhand trips start and end in Dehradun (pickup from ISBT or the railway station). Himachal trips usually start in Delhi or Chandigarh, and each trip page lists its exact pickup point.' },
  { q: 'How experienced are your trip captains?', a: 'Every captain is a certified trek leader with wilderness first-aid training and years on these exact routes. Most of them grew up in the mountains they guide you through.' },
  { q: 'How do I book, and how much do I pay upfront?', a: 'Pick a date and tap Book Now, or message us on WhatsApp. A 30% advance confirms your seat and the balance is due 7 days before departure.' },
  { q: 'Can you plan a private or custom trip?', a: 'Yes. Tell us your dates, group size and budget on the Custom Trip page, and a travel designer will send you a personalised itinerary within 24 hours.' },
]

export default function FaqSection() {
  const [open, setOpen] = useState(0)
  return (
    <section className="container-x py-14">
      <Eyebrow eyebrow="FAQ" title="Have Any Doubts?" />
      <div className="space-y-4">
        {FAQS.map((f, i) => (
          <div key={f.q} className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] dark:bg-slate-800">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-slate-900 dark:text-white">
              {f.q}
              <ChevronDown size={20} className={`shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180 text-sky-brand' : ''}`} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="px-6 pb-5 leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center"><Link to="/contact" className="text-lg text-sky-brand hover:underline">Still have questions? Talk to us</Link></p>
    </section>
  )
}
