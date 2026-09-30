import { useState } from 'react'
import { IMAGES, img } from '../../data/images'

// Lazy image that resolves IMAGES keys and swaps to a known-good photo if a URL ever 404s.
export default function Img({ src, alt, className = '', eager = false, ...rest }) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed ? IMAGES.heroAlt : img(src)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`bg-sky-light dark:bg-slate-800 ${className}`}
      {...rest}
    />
  )
}
