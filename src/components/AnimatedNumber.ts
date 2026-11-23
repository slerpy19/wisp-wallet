/* Wisp Wallet — animated number that tweens between values.
 * Gives balances the smooth roll that real wallet apps have. */

import { useEffect, useRef, useState } from 'react'

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3)

export function useAnimatedNumber(value: number, duration = 620): number {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (from === value) return
    if (!Number.isFinite(from) || !Number.isFinite(value)) {
      fromRef.current = value
      setDisplay(value)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const v = from + (value - from) * easeOut(t)
      setDisplay(v)
      fromRef.current = v
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return display
}
