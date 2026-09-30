import { Helmet } from 'react-helmet-async'
import { IMAGES } from '../../data/images'

const SITE = 'Go Everywhere Trips'

export default function Seo({ title, description, image = IMAGES.heroMain, noindex = false }) {
  const full = title ? `${title} | ${SITE}` : `${SITE} — Go Everywhere. Experience Everything.`
  return (
    <Helmet>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:site_name" content={SITE} />
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  )
}
