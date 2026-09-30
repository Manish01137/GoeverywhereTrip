import { useRef } from 'react'
import { useInView } from 'framer-motion'
import useCountUp from './useCountUp'

export default function CountStat({ end, decimals = 0, suffix = '', label, className = '', valueClass = '', labelClass = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const value = useCountUp(end, inView)
  const shown = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-IN')
  return (
    <div ref={ref} className={className}>
      <div className={valueClass}>{shown}{suffix}</div>
      <div className={labelClass}>{label}</div>
    </div>
  )
}
