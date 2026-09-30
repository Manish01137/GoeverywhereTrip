import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import Seo from '../components/ui/Seo'
import BlogCard from '../components/ui/BlogCard'
import SectionHeader from '../components/ui/SectionHeader'
import Img from '../components/ui/Img'
import { useData } from '../context/DataContext'
import { BLOG_CATEGORIES } from '../data/blogs'
import { IMAGES, img } from '../data/images'
import { fmtDate } from '../lib/format'

export default function Blogs() {
  const { publicBlogs } = useData()
  const [cat, setCat] = useState('All')
  const [featured, ...rest] = publicBlogs
  const list = (cat === 'All' ? rest : publicBlogs.filter((b) => b.category === cat))

  return (
    <>
      <Seo title="Travel Blog — Guides, Tips & Stories" description="Trek guides, packing lists, yatra tips and destination stories from the Go Everywhere Trips crew." image={featured ? img(featured.image) : IMAGES.blog1} />

      <div className="container-x py-10">
        {featured && (
          <motion.article initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="group relative h-[26rem] overflow-hidden rounded-3xl md:h-[30rem]">
            <Img src={featured.image} alt="" eager className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-dark via-deep/40 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <span className="rounded-pill bg-accent px-3 py-1 text-xs font-bold text-white">Featured · {featured.category}</span>
              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
                <Link to={`/blogs/${featured.slug}`} className="after:absolute after:inset-0 after:content-['']">{featured.title}</Link>
              </h1>
              <p className="mt-3 hidden max-w-2xl text-sky-100/90 md:block">{featured.excerpt}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-sky-100/80">
                <span className="inline-flex items-center gap-1"><Calendar size={14} aria-hidden="true" />{fmtDate(featured.date)}</span>
                <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden="true" />{featured.readTime}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-white" aria-hidden="true">Read <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
              </div>
            </div>
          </motion.article>
        )}

        <div className="mt-14">
          <SectionHeader title="Latest Stories" subtitle="Guides and trail notes from our trip captains." className="mb-6" />
          <div role="tablist" aria-label="Blog categories" className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4">
            {BLOG_CATEGORIES.map((c) => (
              <button key={c} role="tab" type="button" aria-selected={cat === c} onClick={() => setCat(c)}
                className={`relative shrink-0 rounded-pill px-5 py-2 text-sm font-semibold transition-colors ${cat === c ? 'text-white' : 'bg-white text-slate-600 hover:bg-sky-light dark:bg-slate-800 dark:text-slate-300'}`}>
                {cat === c && <motion.span layoutId="blog-cat" className="absolute inset-0 rounded-pill bg-sky-brand" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>

          <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((b) => (
                <motion.div key={b.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}>
                  <BlogCard blog={b} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {list.length === 0 && <p className="py-12 text-center text-slate-500">No {cat.toLowerCase()} stories yet — check back soon!</p>}
        </div>
      </div>
    </>
  )
}
