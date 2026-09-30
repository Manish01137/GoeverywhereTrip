import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Eyebrow from '../ui/Eyebrow'
import Img from '../ui/Img'
import { Reveal } from '../ui/Reveal'
import { useData } from '../../context/DataContext'
import { fmtDate } from '../../lib/format'

const Meta = ({ b }) => (
  <p className="flex justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
    <span>Published on {fmtDate(b.date, { day: 'numeric', month: 'short' })}</span>
    <span>{b.readTime?.replace('min read', 'minutes read')}</span>
  </p>
)

export default function BlogsSection() {
  const { publicBlogs } = useData()
  const [featured, ...rest] = publicBlogs
  if (!featured) return null
  return (
    <section className="container-x py-14">
      <Eyebrow eyebrow="Blogs" title="Our Blogs" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal className="grid content-start gap-5">
          {rest.slice(0, 3).map((b) => (
            <Link key={b.id} to={`/blogs/${b.slug}`} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 transition-shadow hover:shadow-card dark:border-slate-700 dark:bg-slate-800">
              <Img src={b.image} alt="" className="h-28 w-32 shrink-0 rounded-lg object-cover sm:w-52" />
              <div className="flex min-w-0 flex-col justify-center gap-2">
                <Meta b={b} />
                <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-sky-dark sm:text-lg dark:text-white">{b.title}</h3>
              </div>
            </Link>
          ))}
        </Reveal>
        <Reveal delay={0.1}>
          <Link to={`/blogs/${featured.slug}`} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3.5 transition-shadow hover:shadow-card dark:border-slate-700 dark:bg-slate-800">
            <div className="relative h-72 overflow-hidden rounded-xl">
              <Img src={featured.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" aria-hidden="true" />
              <p className="absolute left-6 top-1/2 max-w-xs -translate-y-1/2 text-2xl font-black uppercase leading-tight text-yellow-300 drop-shadow">{featured.category} <span className="text-white">Guide</span></p>
            </div>
            <div className="mt-4 space-y-2 px-1">
              <Meta b={featured} />
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-dark dark:text-white">{featured.title}</h3>
              <p className="line-clamp-2 text-slate-600 dark:text-slate-400">{featured.excerpt}</p>
            </div>
          </Link>
        </Reveal>
      </div>
      <div className="mt-8 text-center">
        <Link to="/blogs" className="inline-flex items-center gap-2 rounded-pill bg-sky-brand px-6 py-2.5 font-semibold text-white shadow-lg shadow-sky-brand/30 hover:bg-sky-dark">View All <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>
  )
}
