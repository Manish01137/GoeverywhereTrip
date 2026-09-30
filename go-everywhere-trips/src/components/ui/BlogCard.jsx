import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import Img from './Img'
import { fmtDate } from '../../lib/format'

export default function BlogCard({ blog }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="relative group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card hover:shadow-hover transition-shadow dark:bg-slate-800 dark:ring-1 dark:ring-slate-700"
    >
      <div className="relative h-52 overflow-hidden">
        <Img src={blog.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 rounded-pill bg-sky-brand px-3 py-1 text-xs font-semibold text-white">{blog.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><Calendar size={12} aria-hidden="true" />{fmtDate(blog.date)}</span>
          {blog.readTime && <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden="true" />{blog.readTime}</span>}
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-sky-dark dark:text-white dark:group-hover:text-sky-300">
          <Link to={`/blogs/${blog.slug}`} className="after:absolute after:inset-0 after:content-['']">{blog.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{blog.excerpt}</p>
        <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-brand" aria-hidden="true">
          Read More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
        </span>
      </div>
    </motion.article>
  )
}
