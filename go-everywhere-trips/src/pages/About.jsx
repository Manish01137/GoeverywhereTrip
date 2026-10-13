import { motion } from 'framer-motion'
import { Compass, HeartHandshake, Leaf } from 'lucide-react'
import Seo from '../components/ui/Seo'
import PageHero from '../components/ui/PageHero'
import SectionHeader from '../components/ui/SectionHeader'
import CountStat from '../components/ui/CountStat'
import Img from '../components/ui/Img'
import Button from '../components/ui/Button'
import { Reveal, Stagger, fadeUp } from '../components/ui/Reveal'
import { InstagramIcon, WhatsAppIcon } from '../components/ui/BrandIcons'
import { IMAGES } from '../data/images'
import { breadcrumbs } from '../lib/schema'
import { useData } from '../context/DataContext'

const STATS = [
  { end: 500, suffix: '+', label: 'Travellers' },
  { end: 50, suffix: '+', label: 'Destinations' },
  { end: 5, suffix: ' Years', label: 'Experience' },
  { end: 100, suffix: '%', label: 'Safe Returns' },
]

const TEAM = [
  { name: 'Vikram Rawat', role: 'Founder & Lead Trekker', image: 'team1', bio: '120+ Himalayan summits' },
  { name: 'Neha Joshi', role: 'Operations Head', image: 'team2', bio: 'Keeps every batch on time' },
  { name: 'Aditya Thapa', role: 'Trip Captain', image: 'team3', bio: 'Wilderness first responder' },
  { name: 'Riya Negi', role: 'Travel Designer', image: 'team4', bio: 'Crafts every custom trip' },
]

const VALUES = [
  { Icon: Compass, title: 'Local First', desc: 'Our guides, drivers and homestays are from the valleys we travel through — your money stays in the mountains.' },
  { Icon: HeartHandshake, title: 'People Over Profit', desc: 'Small groups, honest pricing and a captain who genuinely cares whether you had the best week of your year.' },
  { Icon: Leaf, title: 'Leave No Trace', desc: 'Every trek carries back more waste than it creates. Plastic-free camps and zero-litter trails, always.' },
]

export default function About() {
  const { settings, waLink } = useData()
  return (
    <>
      <Seo title="About Us" description="Meet the Dehradun-based team behind Go Everywhere Trips — local trek leaders and travel designers running safe, small-group trips since 2021." image={IMAGES.aboutHero} jsonLd={breadcrumbs([['Home', '/'], ['About', '/about']])} />
      <PageHero image={IMAGES.aboutHero} eyebrow="Our story" title="Who We Are" subtitle="A bunch of pahadi kids from Dehradun who turned weekend treks into a travel company." tall />

      <section className="relative z-10 -mt-12">
        <div className="container-x">
          <div className="card grid grid-cols-2 divide-slate-100 p-6 md:grid-cols-4 md:divide-x dark:divide-slate-700">
            {STATS.map((s) => (
              <CountStat key={s.label} {...s} className="py-3 text-center" valueClass="text-3xl font-black text-sky-brand md:text-4xl" labelClass="mt-1 text-sm font-medium text-slate-500" />
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid items-center gap-12 py-20 lg:grid-cols-2">
        <Reveal className="relative">
          <Img src="treks" alt="Our group on a Himalayan ridge" className="h-[26rem] w-full rounded-3xl object-cover shadow-hover" />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-accent px-6 py-4 text-white shadow-xl sm:block">
            <div className="text-3xl font-black">2021</div>
            <div className="text-xs font-semibold uppercase tracking-wider">Founded in Dehradun</div>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <SectionHeader eyebrow="How it started" title="From Weekend Treks to 50+ Destinations" className="mb-6" />
          <div className="space-y-4 leading-relaxed text-slate-600 dark:text-slate-300">
            <p>It started with a WhatsApp group of 12 friends and a borrowed Tempo Traveller to Chopta in 2021. Friends told friends, strangers became regulars, and before we knew it we were running a batch every weekend.</p>
            <p><strong className="text-deep dark:text-white">Our mission</strong> is simple: make the Himalaya — and the rest of India — accessible, safe and deeply personal for every traveller, whether it’s your first trek or your fiftieth.</p>
            <p><strong className="text-deep dark:text-white">Our philosophy:</strong> small groups, local crews, honest prices and zero shortcuts on safety. We’d rather cancel a summit than risk a traveller.</p>
          </div>
        </Reveal>
      </section>

      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="container-x">
          <SectionHeader eyebrow="The crew" title="Meet the Team" subtitle="The people who’ll be answering your WhatsApps at 2 AM." centered />
          <Stagger className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {TEAM.map((m) => (
              <motion.div key={m.name} variants={fadeUp} className="group text-center">
                <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full ring-4 ring-sky-light transition-all group-hover:ring-sky-brand md:h-40 md:w-40 dark:ring-slate-700">
                  <Img src={m.image} alt={m.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="mt-4 font-bold text-deep dark:text-white">{m.name}</h3>
                <span className="mt-1 inline-block rounded-pill bg-sky-light px-3 py-0.5 text-xs font-semibold text-sky-dark dark:bg-sky-500/15 dark:text-sky-300">{m.role}</span>
                <p className="mt-2 text-xs text-slate-500">{m.bio}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Instagram`} className="rounded-full p-1.5 text-slate-400 hover:bg-sky-light hover:text-sky-dark"><InstagramIcon size={16} /></a>
                  <a href={waLink(`Hi ${m.name.split(' ')[0]}!`)} target="_blank" rel="noopener noreferrer" aria-label={`Message ${m.name} on WhatsApp`} className="rounded-full p-1.5 text-slate-400 hover:bg-sky-light hover:text-green-600"><WhatsAppIcon size={16} /></a>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-x py-20">
        <SectionHeader eyebrow="What we stand for" title="Our Values" centered />
        <Stagger className="grid gap-6 md:grid-cols-3">
          {VALUES.map(({ Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }} className="card p-8 hover:shadow-hover">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-brand text-white"><Icon size={26} aria-hidden="true" /></span>
              <h3 className="mt-5 text-xl font-bold text-deep dark:text-white">{title}</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{desc}</p>
            </motion.div>
          ))}
        </Stagger>
      </section>

      <section className="container-x pb-20">
        <Reveal className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-400 px-8 py-10 text-white md:flex-row">
          <div className="flex items-center gap-4">
            <InstagramIcon size={44} />
            <div>
              <p className="text-2xl font-black">@goeverywheretrips</p>
              <p className="text-white/90">Daily reels from the trail, trip drops & giveaways.</p>
            </div>
          </div>
          <Button href={settings.instagram} variant="white" size="lg">Follow on Instagram</Button>
        </Reveal>
      </section>
    </>
  )
}
