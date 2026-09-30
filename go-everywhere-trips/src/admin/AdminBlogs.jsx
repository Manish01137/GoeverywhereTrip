import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Img from '../components/ui/Img'
import { Field } from '../pages/Contact'
import { useData } from '../context/DataContext'
import { BLOG_CATEGORIES } from '../data/blogs'
import { fmtDate, slugify } from '../lib/format'
import { EmptyRow, IconBtn, Panel, StatusBadge, Table, Td } from './ui'

const BLANK = { title: '', category: 'Treks', image: '', excerpt: '', content: '', status: 'Published' }

export default function AdminBlogs() {
  const { blogs, setBlogs } = useData()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')

  const open = (b) => {
    setError('')
    if (!b) { setForm(BLANK); setEditing('new'); return }
    setForm({ ...BLANK, ...b, content: Array.isArray(b.content) ? b.content.join('\n\n') : b.content || '' })
    setEditing(b.id)
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.excerpt.trim()) return setError('Title and excerpt are required')
    const record = {
      ...form,
      image: form.image.trim() || 'blog2',
      content: form.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      readTime: `${Math.max(2, Math.round(form.content.split(/\s+/).length / 200))} min read`,
    }
    setBlogs((all) => {
      if (editing === 'new') {
        let slug = slugify(record.title)
        while (all.some((b) => b.slug === slug)) slug += '-2'
        return [{ ...record, id: Math.max(0, ...all.map((b) => b.id)) + 1, slug, date: new Date().toISOString().slice(0, 10), author: 'Go Everywhere Team' }, ...all]
      }
      return all.map((b) => (b.id === editing ? { ...b, ...record } : b))
    })
    setEditing(null)
  }

  return (
    <>
      <Panel title={`${blogs.length} articles`} action={<button type="button" onClick={() => open(null)} className="inline-flex items-center gap-2 rounded-pill bg-sky-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-dark"><Plus size={16} /> Add Blog</button>}>
        <Table head={['Article', 'Category', 'Date', 'Status', 'Actions']} empty={!blogs.length && <EmptyRow text="No blogs yet." />}>
          {blogs.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <Td>
                <div className="flex items-center gap-3">
                  <Img src={b.image} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                  <p className="line-clamp-2 font-semibold">{b.title}</p>
                </div>
              </Td>
              <Td>{b.category}</Td>
              <Td className="whitespace-nowrap text-slate-500">{fmtDate(b.date)}</Td>
              <Td><StatusBadge status={b.status || 'Published'} /></Td>
              <Td>
                <div className="flex gap-1">
                  <IconBtn label={`Edit ${b.title}`} onClick={() => open(b)}><Pencil size={16} /></IconBtn>
                  <IconBtn label={`Delete ${b.title}`} tone="red" onClick={() => window.confirm(`Delete “${b.title}”?`) && setBlogs((all) => all.filter((x) => x.id !== b.id))}><Trash2 size={16} /></IconBtn>
                  {b.status !== 'Draft' && <IconBtn label={`View ${b.title}`} href={`/blogs/${b.slug}`}><Eye size={16} /></IconBtn>}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add Blog' : 'Edit Blog'} variant="drawer" wide
        footer={<div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="rounded-pill border border-slate-200 px-5 py-2.5 text-sm font-semibold dark:border-slate-700">Cancel</button><button type="submit" form="blog-form" className="rounded-pill bg-sky-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-dark">Save Blog</button></div>}>
        <form id="blog-form" onSubmit={save} className="space-y-4">
          <Field id="b-title" label="Title *"><input id="b-title" value={form.title} onChange={set('title')} className="input" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="b-cat" label="Category"><select id="b-cat" value={form.category} onChange={set('category')} className="input">{BLOG_CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field id="b-status" label="Status"><select id="b-status" value={form.status} onChange={set('status')} className="input"><option>Published</option><option>Draft</option></select></Field>
          </div>
          <Field id="b-img" label="Image URL"><input id="b-img" value={form.image} onChange={set('image')} className="input" placeholder="https://images.unsplash.com/…" /></Field>
          {form.image && <Img src={form.image} alt="Preview" className="h-32 w-full rounded-xl object-cover" />}
          <Field id="b-ex" label="Excerpt *"><textarea id="b-ex" rows={2} value={form.excerpt} onChange={set('excerpt')} className="input resize-none" /></Field>
          <Field id="b-content" label="Content (blank line between paragraphs)"><textarea id="b-content" rows={10} value={form.content} onChange={set('content')} className="input" /></Field>
          {error && <p role="alert" className="text-sm font-semibold text-red-500">{error}</p>}
        </form>
      </Modal>
    </>
  )
}
