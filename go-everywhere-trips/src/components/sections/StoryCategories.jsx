import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Img from '../ui/Img'

// Instagram-story style category circles inside a floating white pill.
const STORIES = [
  { label: 'Best Sellers', image: 'trip1', to: '/trips?sort=popular', featured: true },
  { label: 'Treks', image: 'treks', to: '/trips?type=Trek' },
  { label: 'Weekend', image: 'weekend', to: '/trips?type=Weekend' },
  { label: 'Spiritual', image: 'kedarnath', to: '/trips?type=Spiritual' },
  { label: 'Group Tours', image: 'groupTours', to: '/trips?type=Group%20Tour' },
  { label: 'Customised', image: 'customTrips', to: '/custom-trip' },
  { label: 'Uttarakhand', image: 'chopta', to: '/trips?destination=Uttarakhand' },
  { label: 'Himachal', image: 'manali', to: '/trips?destination=Himachal%20Pradesh' },
  { label: 'Spiti', image: 'spiti', to: '/trips?search=Spiti' },
  { label: 'Rajasthan', image: 'rajasthan', to: '/trips?destination=Rajasthan' },
  { label: 'Andaman', image: 'andaman', to: '/trips?destination=Andaman' },
  { label: 'Corporate', image: 'corporate', to: '/contact?subject=Corporate%20Offsite' },
]

export default function StoryCategories() {
  return (
    <section className="container-x relative z-10 pt-10">
      <motion.nav
        aria-label="Trip categories"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-[2.5rem] bg-white px-4 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.10)] sm:rounded-full sm:px-8 dark:bg-slate-800"
      >
        <ul className="no-scrollbar flex gap-4 overflow-x-auto sm:gap-6">
          {STORIES.map((s) => (
            <li key={s.label} className="shrink-0">
              <Link to={s.to} className="group flex w-[76px] flex-col items-center gap-2 text-center sm:w-[88px]">
                <span className={`rounded-full p-[3px] transition-transform duration-300 group-hover:scale-105 ${s.featured ? 'bg-gradient-to-tr from-green-500 to-emerald-300' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-fuchsia-600'}`}>
                  <span className="block rounded-full bg-white p-[3px] dark:bg-slate-800">
                    <Img src={s.image} alt="" className="h-16 w-16 rounded-full object-cover sm:h-[70px] sm:w-[70px]" />
                  </span>
                </span>
                <span className={`text-xs font-medium sm:text-sm ${s.featured ? 'font-semibold text-green-600' : 'text-slate-700 group-hover:text-sky-dark dark:text-slate-200'}`}>{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.nav>
    </section>
  )
}
