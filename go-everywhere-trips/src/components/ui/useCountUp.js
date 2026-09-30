import { useEffect, useState } from 'react'

// Eased count-up driven by requestAnimationFrame; starts when `start` flips true.
export default function useCountUp(end, start, duration = 1600) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      setValue(end * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [end, start, duration])
  return value
}
