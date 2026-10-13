import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Mail, MapPin, Send } from 'lucide-react'
import Seo from '../components/ui/Seo'
import PageHero from '../components/ui/PageHero'
import Button from '../components/ui/Button'
import SuccessCheck from '../components/ui/SuccessCheck'
import { Reveal } from '../components/ui/Reveal'
import { InstagramIcon, WhatsAppIcon } from '../components/ui/BrandIcons'
import { IMAGES } from '../data/images'
import { useData } from '../context/DataContext'
import { isEmail, isPhone } from '../lib/validate'
import { breadcrumbs, organization } from '../lib/schema'

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' }

export default function Contact() {
  const [params] = useSearchParams()
  const { addLead, settings, waLink, trackWhatsApp } = useData()
  const [form, setForm] = useState({ ...EMPTY, subject: params.get('subject') || '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim()) er.name = 'Please tell us your name'
    if (!isEmail(form.email)) er.email = 'Enter a valid email'
    if (!isPhone(form.phone)) er.phone = 'Enter a valid 10-digit mobile number'
    if (!form.message.trim()) er.message = 'Add a short message'
    setErrors(er)
    if (Object.keys(er).length) return
    addLead({ source: 'contact', name: form.name, phone: form.phone, email: form.email, enquiry: [form.subject, form.message].filter(Boolean).join(' — ') })
    setSent(true)
  }

  const details = [
    { Icon: WhatsAppIcon, label: 'WhatsApp / Call', value: settings.phoneDisplay, href: waLink(), tone: 'bg-green-500', onClick: () => trackWhatsApp('Contact page') },
    { Icon: InstagramIcon, label: 'Instagram', value: '@goeverywheretrips', href: settings.instagram, tone: 'bg-gradient-to-br from-pink-500 to-orange-400' },
    { Icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}`, tone: 'bg-sky-brand' },
    { Icon: MapPin, label: 'Office', value: settings.address, tone: 'bg-deep' },
    { Icon: Clock, label: 'Office Hours', value: 'Mon–Sat 9 AM – 8 PM · WhatsApp 24/7', tone: 'bg-accent' },
  ]

  return (
    <>
      <Seo title="Contact Us" description="Talk to the Go Everywhere Trips team in Dehradun — WhatsApp +91 94107 76387, Instagram @goeverywheretrips, or send us a message." image={IMAGES.heroAlt} jsonLd={[organization(settings), breadcrumbs([['Home', '/'], ['Contact', '/contact']])]} />
      <PageHero image={IMAGES.heroAlt} eyebrow="Say hello" title="Let’s Plan Your Trip" subtitle="Questions, custom plans or just trail gossip — we usually reply within 30 minutes." />

      <div className="container-x grid grid-cols-1 gap-12 py-16 lg:grid-cols-2">
        <Reveal className="card p-6 md:p-8">
          {sent ? (
            <SuccessCheck title={`Thanks, ${form.name.split(' ')[0]}!`} message="We’ll WhatsApp you shortly on the number you shared.">
              <Button variant="ghost" onClick={() => { setForm(EMPTY); setSent(false) }}>Send another message</Button>
            </SuccessCheck>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-deep dark:text-white">Send us a message</h2>
                <p className="mt-1 text-sm text-slate-500">Fields marked * are required.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Name *" error={errors.name}><input id="name" name="name" autoComplete="name" value={form.name} onChange={onChange} className="input" placeholder="Your full name" /></Field>
                <Field id="phone" label="Phone *" error={errors.phone}><input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={onChange} className="input" placeholder="98765 43210" /></Field>
              </div>
              <Field id="email" label="Email *" error={errors.email}><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} className="input" placeholder="you@example.com" /></Field>
              <Field id="subject" label="Subject"><input id="subject" name="subject" value={form.subject} onChange={onChange} className="input" placeholder="e.g. Chopta trek in December" /></Field>
              <Field id="message" label="Message *" error={errors.message}><textarea id="message" name="message" rows={5} value={form.message} onChange={onChange} className="input resize-none" placeholder="Tell us your dates, group size and what you’re dreaming of…" /></Field>
              <Button type="submit" size="lg" className="w-full">
                <Send size={18} aria-hidden="true" /> Send Message
              </Button>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.1} className="space-y-6">
          <ul className="space-y-3">
            {details.map(({ Icon, label, value, href, tone, onClick }) => {
              const Inner = (
                <>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${tone}`}><Icon size={20} aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                    <span className="block break-words font-semibold text-slate-900 dark:text-white">{value}</span>
                  </span>
                </>
              )
              return (
                <motion.li key={label} whileHover={{ x: 4 }}>
                  {href ? (
                    <a href={href} onClick={onClick} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="card flex items-center gap-4 p-4 hover:shadow-hover">{Inner}</a>
                  ) : (
                    <div className="card flex items-center gap-4 p-4">{Inner}</div>
                  )}
                </motion.li>
              )
            })}
          </ul>
          <div className="overflow-hidden rounded-2xl shadow-card">
            <iframe
              title="Map of Go Everywhere Trips office in Dehradun"
              src="https://www.google.com/maps?q=Rajpur+Road,+Dehradun,+Uttarakhand&output=embed"
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </>
  )
}

export function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-red-500" role="alert">{error}</p>}
    </div>
  )
}
