import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import Seo from '../components/ui/Seo'
import Img from '../components/ui/Img'
import BlogCard from '../components/ui/BlogCard'
import Button from '../components/ui/Button'
import MountainArt from '../components/ui/MountainArt'
import { Reveal } from '../components/ui/Reveal'
import { WhatsAppIcon } from '../components/ui/BrandIcons'
import { useData } from '../context/DataContext'
import { img } from '../data/images'
import { fmtDate } from '../lib/format'

export default function BlogPost() {
  const { slug } = useParams()
  const { publicBlogs, waLink } = useData()
  const blog = publicBlogs.find((b) => b.slug === slug)

  if (!blog) {
    return (
      <div className="container-x flex flex-col items-center py-24 text-center">
        <Seo title="Article not found" noindex />
        <MountainArt className="w-56" float />
        <h1 className="mt-6 text-2xl font-bold text-deep dark:text-white">That article wandered off</h1>
        <Button to="/blogs" className="mt-6">Back to the blog</Button>
      </div>
    )
  }

  const paragraphs = Array.isArray(blog.content) ? blog.content : String(blog.content || blog.excerpt).split(/\n{2,}/)
  const more = publicBlogs.filter((b) => b.id !== blog.id).slice(0, 3)

  return (
    <>
      <Seo title={blog.title} description={blog.excerpt} image={img(blog.image)} />
      <article className="container-x max-w-3xl py-10">
        <Link to="/blogs" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-brand hover:underline"><ArrowLeft size={16} /> All articles</Link>
        <span className="mt-6 block w-fit rounded-pill bg-sky-light px-3 py-1 text-xs font-bold text-sky-dark dark:bg-sky-500/15 dark:text-sky-300">{blog.category}</span>
        <h1 className="mt-3 text-3xl font-black leading-tight text-deep md:text-5xl dark:text-white">{blog.title}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          {blog.author && <span className="inline-flex items-center gap-1"><User size={14} aria-hidden="true" />{blog.author}</span>}
          <span className="inline-flex items-center gap-1"><Calendar size={14} aria-hidden="true" />{fmtDate(blog.date)}</span>
          {blog.readTime && <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden="true" />{blog.readTime}</span>}
        </div>
        <Img src={blog.image} alt="" eager className="mt-8 h-72 w-full rounded-3xl object-cover md:h-96" />
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-deep p-8 text-center text-white sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="text-xl font-bold">Inspired? Let’s make it happen.</p>
            <p className="text-sm text-sky-100/80">Our trip captains can answer any question about this route.</p>
          </div>
          <Button href={waLink(`Hi! I just read "${blog.title}" and want to plan a trip`)} variant="whatsapp"><WhatsAppIcon size={18} /> Ask on WhatsApp</Button>
        </div>
      </article>

      {more.length > 0 && (
        <Reveal as="section" className="container-x pb-20">
          <h2 className="mb-6 border-l-4 border-sky-brand pl-4 text-2xl font-bold text-deep dark:text-white">Keep Reading</h2>
          <div className="grid gap-6 md:grid-cols-3">{more.map((b) => <BlogCard key={b.id} blog={b} />)}</div>
        </Reveal>
      )}
    </>
  )
}
