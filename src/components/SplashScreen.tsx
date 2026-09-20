import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

const STEP_MS = 20 // 100 steps × 20ms = 2000ms

/**
 * Full-screen white overlay with a 0 → 100 counter in the bottom-left,
 * then a 700ms fade. Users who prefer reduced motion skip straight through.
 */
export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [count, setCount] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return
    }

    // Derive the number from elapsed time so a throttled timer (background
    // tab, slow device) still finishes in ~2s instead of stretching out.
    const start = performance.now()
    const timers: number[] = []
    const interval = window.setInterval(() => {
      const n = Math.min(100, Math.floor((performance.now() - start) / STEP_MS))
      setCount(n)
      if (n >= 100) {
        window.clearInterval(interval)
        timers.push(window.setTimeout(() => setExiting(true), 200))
        timers.push(window.setTimeout(onComplete, 900))
      }
    }, STEP_MS)

    return () => {
      window.clearInterval(interval)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [onComplete])

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="off"
      className={`fixed inset-0 z-[100] flex items-end justify-start bg-white transition-opacity duration-700 ${
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <span aria-hidden="true" className="p-6 text-7xl leading-none font-bold text-black tabular-nums md:p-10 md:text-9xl">
        {count}
      </span>
    </div>
  )
}
