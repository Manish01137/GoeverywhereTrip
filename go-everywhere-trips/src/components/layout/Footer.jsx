import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { InstagramIcon, WhatsAppIcon, YouTubeIcon } from '../ui/BrandIcons'
import { Logo, TRIP_MENU } from './Navbar'
import { useData } from '../../context/DataContext'

const QUICK = [
  { label: 'All Trips', to: '/trips' },
  { label: 'Plan a Custom Trip', to: '/custom-trip' },
  { label: 'About Us', to: '/about' },
  { label: 'Travel Blog', to: '/blogs' },
  { label: 'Contact', to: '/contact' },
]

export default function Footer() {
  const { publicTrips, settings, waLink } = useData()
  const socials = [
    { label: 'Instagram', href: settings.instagram, Icon: InstagramIcon },
    { label: 'WhatsApp', href: waLink(), Icon: WhatsAppIcon },
    { label: 'YouTube', href: settings.youtube, Icon: YouTubeIcon },
  ]

  return (
    <footer className="bg-deep text-sky-100 dark:bg-deep-dark">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-sky-100/80">
            Go Everywhere Trips is a Dehradun-based travel company running small-group treks, road trips and spiritual yatras across the Himalaya and beyond.
          </p>
          <p className="mt-3 text-sm font-semibold text-white italic">“Go Everywhere. Experience Everything.”</p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-sky-brand transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Quick Links">
          {QUICK.map((l) => <FooterLink key={l.to} to={l.to}>{l.label}</FooterLink>)}
          {TRIP_MENU.slice(0, 2).map((l) => <FooterLink key={l.label} to={l.to}>{l.label}</FooterLink>)}
        </FooterCol>

        <FooterCol title="Popular Trips">
          {publicTrips.slice(0, 6).map((t) => <FooterLink key={t.slug} to={`/trips/${t.slug}`}>{t.name}</FooterLink>)}
        </FooterCol>

        <FooterCol title="Contact Us">
          <li><a href={`tel:+${settings.whatsapp}`} className="flex items-start gap-2 hover:text-white"><Phone size={16} className="mt-0.5 shrink-0" />{settings.phoneDisplay}</a></li>
          <li><a href={`mailto:${settings.email}`} className="flex items-start gap-2 hover:text-white break-all"><Mail size={16} className="mt-0.5 shrink-0" />{settings.email}</a></li>
          <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" />{settings.address}</li>
          <li className="text-sky-100/70">Mon–Sat · 9:00 AM – 8:00 PM</li>
        </FooterCol>
      </div>

      <div className="border-t-2 border-sky-brand">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-sky-100/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Go Everywhere Trips, Dehradun. All rights reserved.</p>
          <p>Made with ❤️ in the Himalaya · <Link to="/admin/login" className="hover:text-white">Admin</Link></p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">{title}</h3>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return <li><Link to={to} className="hover:text-white hover:underline underline-offset-4">{children}</Link></li>
}
