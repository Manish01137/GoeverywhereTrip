import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, HeartHandshake, ShieldCheck, Users } from 'lucide-react'
import Eyebrow from '../ui/Eyebrow'
import Img from '../ui/Img'
import Button from '../ui/Button'
import { Reveal } from '../ui/Reveal'

const LEFT = [
  { Icon: HeartHandshake, title: 'Trusted Experience', desc: "We don't just run trips — we design experiences with local expertise, trusted partners and hundreds of safe departures." },
  { Icon: ShieldCheck, title: 'Safety First', desc: 'Certified trek leaders, oxygen & first-aid on every trek, verified stays and 24/7 WhatsApp support.' },
]
const RIGHT = [
  { Icon: Award, title: 'Honest Pricing', desc: 'Direct operator prices with everything listed upfront — no surprise add-ons after you book.' },
  { Icon: Users, title: 'More Than Travel', desc: "Go Everywhere is a community — strangers become trek buddies, and trek buddies become lifelong friends." },
]

function Card({ Icon, title, desc, active, setActive }) {
  const on = active === title
  return (
    <motion.div
      onMouseEnter={() => setActive(title)}
      whileHover={{ y: -4 }}
      className={`rounded-xl border p-5 transition-colors duration-300 ${on ? 'border-sky-brand bg-sky-brand text-white shadow-hover' : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'}`}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${on ? 'bg-white/15 text-white' : 'bg-sky-light text-sky-dark dark:bg-slate-700 dark:text-sky-300'}`}><Icon size={24} aria-hidden="true" /></span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className={`mt-2 text-sm leading-relaxed ${on ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>{desc}</p>
    </motion.div>
  )
}

export default function WhyChooseUs() {
  const [active, setActive] = useState('Trusted Experience')
  return (
    <section className="container-x py-14">
      <Eyebrow eyebrow="Why us" title="Why Choose Go Everywhere?">
        <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-400">
          Travel changes how you see the world. For over five years we’ve made the Himalaya accessible, safe and unforgettable — with a local crew,
          small groups and a community of travellers who keep coming back.
        </p>
      </Eyebrow>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr_1fr]">
        <Reveal className="grid gap-5">{LEFT.map((c) => <Card key={c.title} {...c} active={active} setActive={setActive} />)}</Reveal>
        <Reveal delay={0.1} className="relative min-h-[380px] pb-24 lg:pb-0">
          <Img src="aboutHero" alt="A Go Everywhere group on a Himalayan trail" className="h-[380px] w-full rounded-2xl object-cover lg:h-full" />
          <div className="absolute inset-x-4 bottom-0 rounded-xl bg-white p-5 shadow-2xl lg:-bottom-14 dark:bg-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium italic text-slate-900 dark:text-white">5+ Years of Building<br className="hidden sm:block" /> Meaningful Journeys</p>
              <Button to="/custom-trip" size="sm">Make Your Plan Now!</Button>
            </div>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
              {[['ig1', '500+ Happy Travellers'], ['ig3', '200+ Trips Run'], ['ig6', '4.9★ Average Rating']].map(([img, label]) => (
                <li key={label} className="flex items-center gap-1.5"><Img src={img} alt="" className="h-6 w-6 rounded-full object-cover" />{label}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.2} className="grid gap-5">{RIGHT.map((c) => <Card key={c.title} {...c} active={active} setActive={setActive} />)}</Reveal>
      </div>
    </section>
  )
}
