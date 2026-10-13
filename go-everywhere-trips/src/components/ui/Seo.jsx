import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { IMAGES } from '../../data/images'
import { SITE_NAME, SITE_URL } from '../../site.config'

// Per-page <head>: title, description, canonical URL, social previews and optional JSON-LD.
export default function Seo({ title, description, image = IMAGES.heroMain, noindex = false, type = 'website', jsonLd }) {
  const { pathname } = useLocation()
  const full = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Treks, Group Tours & Yatras from Dehradun`
  const url = SITE_URL + (pathname === '/' ? '/' : pathname.replace(/\/$/, ''))
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  return (
    <Helmet>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', ...b })}</script>
      ))}
    </Helmet>
  )
}
