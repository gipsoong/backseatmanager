/** A number that ticks up from zero to its value when it first shows (the season review's headline). */
import { useEffect, useState } from 'react'
import { reducedMotion } from './motion.ts'

export function CountUp({ value, ms = 900, format = (v: number) => String(Math.round(v)) }: { value: number; ms?: number; format?: (v: number) => string }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (reducedMotion()) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / ms)
      // Ease out: quick at first, settling on the number.
      setShown(value * (1 - (1 - t) ** 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // Frames stop in a hidden tab: land on the number regardless.
    const land = setTimeout(() => setShown(value), ms + 50)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(land)
    }
  }, [value, ms])
  return <span className="count">{format(reducedMotion() ? value : shown)}</span>
}
