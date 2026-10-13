// schema.org builders for Google rich results.
import { SITE_NAME, SITE_URL } from '../site.config'
import { IMAGES, img, large } from '../data/images'
import { upcoming } from './format'

const abs = (path) => SITE_URL + path

export const organization = (settings) => ({
  '@type': 'TravelAgency',
  '@id': abs('/#organization'),
  name: SITE_NAME,
  url: abs('/'),
  logo: abs('/favicon.svg'),
  image: IMAGES.heroMain,
  slogan: 'Go Everywhere. Experience Everything.',
  description: 'Dehradun-based travel company running Himalayan treks, group tours, spiritual yatras and custom trips.',
  telephone: '+' + settings.whatsapp,
  email: settings.email,
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: settings.address.split(',')[0],
    addressLocality: 'Dehradun',
    addressRegion: 'Uttarakhand',
    postalCode: (settings.address.match(/\b\d{6}\b/) || [])[0],
    addressCountry: 'IN',
  },
  areaServed: ['Uttarakhand', 'Himachal Pradesh', 'Rajasthan', 'Andaman and Nicobar Islands', 'India'],
  openingHours: 'Mo-Sa 09:00-20:00',
  sameAs: [settings.instagram, settings.youtube].filter(Boolean),
})

export const website = () => ({
  '@type': 'WebSite',
  '@id': abs('/#website'),
  name: SITE_NAME,
  url: abs('/'),
  publisher: { '@id': abs('/#organization') },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: abs('/trips?search={search_term_string}') },
    'query-input': 'required name=search_term_string',
  },
})

export const breadcrumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
})

export const touristTrip = (trip) => {
  const deps = upcoming(trip.departures)
  return {
    '@type': 'TouristTrip',
    name: trip.name,
    description: trip.description,
    url: abs(`/trips/${trip.slug}`),
    image: trip.gallery.slice(0, 4).map((g) => large(img(g), 1200)),
    touristType: trip.type,
    provider: { '@id': abs('/#organization') },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: trip.itinerary.length,
      itemListElement: trip.itinerary.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: `Day ${i + 1}: ${d.title}`, description: d.desc })),
    },
    offers: (deps.length ? deps : [{ date: null, seats: 1 }]).map((d) => ({
      '@type': 'Offer',
      price: trip.price,
      priceCurrency: 'INR',
      url: abs(`/trips/${trip.slug}`),
      availability: d.seats > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      ...(d.date && { validFrom: new Date().toISOString().slice(0, 10), availabilityStarts: d.date }),
      seller: { '@id': abs('/#organization') },
    })),
  }
}

export const faqPage = (faqs) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

export const blogPosting = (blog) => ({
  '@type': 'BlogPosting',
  headline: blog.title,
  description: blog.excerpt,
  image: large(img(blog.image), 1200),
  datePublished: blog.date,
  dateModified: blog.date,
  author: { '@type': 'Person', name: blog.author || SITE_NAME },
  publisher: { '@id': abs('/#organization') },
  mainEntityOfPage: abs(`/blogs/${blog.slug}`),
})
