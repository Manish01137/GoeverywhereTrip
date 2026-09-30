import { motion } from 'framer-motion'

// Fade + slide up on scroll (cheat-sheet #1).
export function Reveal({ as = 'div', delay = 0, y = 40, className = '', children, ...rest }) {
  const M = motion[as]
  return (
    <M
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </M>
  )
}

// Stagger container + item variants (cheat-sheet #2).
export const stagger = (gap = 0.1) => ({ hidden: {}, show: { transition: { staggerChildren: gap } } })
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

export function Stagger({ gap = 0.1, className = '', children, ...rest }) {
  return (
    <motion.div variants={stagger(gap)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className={className} {...rest}>
      {children}
    </motion.div>
  )
}
