import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-sky-brand text-white hover:bg-sky-dark shadow-sm',
  outline: 'border-2 border-white text-white hover:bg-white hover:text-deep',
  ghost: 'border border-sky-brand text-sky-dark hover:bg-sky-light dark:text-sky-300 dark:hover:bg-slate-800',
  whatsapp: 'bg-green-500 text-white hover:bg-green-600 shadow-sm',
  dark: 'bg-deep text-white hover:bg-deep-dark',
  white: 'bg-white text-deep hover:bg-sky-light',
}
const SIZES = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' }

const MotionLink = motion.create(Link)

// Renders a <Link> for `to`, an <a> for `href`, otherwise a <button>.
export default function Button({ to, href, variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  const motionProps = { whileTap: { scale: 0.97 }, whileHover: { scale: 1.02 } }

  if (to) return <MotionLink to={to} className={cls} {...motionProps} {...rest}>{children}</MotionLink>
  if (href)
    return (
      <motion.a href={href} className={cls} {...motionProps} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </motion.a>
    )
  return <motion.button type="button" className={cls} {...motionProps} {...rest}>{children}</motion.button>
}
