import { motion } from 'framer-motion'
import Img from '../ui/Img'
import Eyebrow from '../ui/Eyebrow'
import Button from '../ui/Button'
import { InstagramIcon } from '../ui/BrandIcons'
import { useData } from '../../context/DataContext'

const POSTS = ['ig1', 'ig2', 'ig3', 'ig4', 'ig5', 'ig6']

export default function InstagramSection() {
  const { settings } = useData()
  return (
    <section className="bg-white py-20 dark:bg-slate-900">
      <div className="container-x">
        <Eyebrow eyebrow="On the move" title="Follow the Journey">
          <p className="mt-2 text-slate-500 dark:text-slate-400">Real trips, real travellers — tag <strong>@goeverywheretrips</strong> to get featured.</p>
        </Eyebrow>
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-card md:grid-cols-6 md:gap-2">
          {POSTS.map((p, i) => (
            <motion.a
              key={p}
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open Instagram post ${i + 1} on @goeverywheretrips`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative aspect-square overflow-hidden"
            >
              <Img src={p} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center bg-deep/60 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
                <InstagramIcon size={32} />
              </span>
            </motion.a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button href={settings.instagram} variant="primary"><InstagramIcon size={18} /> Follow @goeverywheretrips</Button>
        </div>
      </div>
    </section>
  )
}
