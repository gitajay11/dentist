import { useEffect, useRef, useState, type CSSProperties } from 'react'

const EASE = 'cubic-bezier(0.16,1,0.3,1)'

/**
 * Reveals a section's children one after another the first time the
 * section scrolls into view. Pure CSS transitions — no animation library.
 *
 * `enabled` lets a section wait (e.g. until the splash screen has gone)
 * before it starts observing.
 */
export function useStaggeredReveal(count: number, threshold = 0.15, enabled = true) {
  const containerRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled || visible) return
    const el = containerRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [enabled, visible, threshold])

  /** Style for the child at `index`; indices beyond `count` share the last delay. */
  const getAnimStyle = (index: number): CSSProperties => {
    const delay = `${Math.min(index, Math.max(count - 1, 0)) * 120}ms`
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ${EASE} ${delay}, transform 0.6s ${EASE} ${delay}`,
    }
  }

  return { containerRef, getAnimStyle, visible }
}
