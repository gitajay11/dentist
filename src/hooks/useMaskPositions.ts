import { useEffect, useState, type RefObject } from 'react'

export interface MaskPosition {
  /** Card offset from the section's top-left corner (layout position, ignores transforms). */
  x: number
  y: number
  /** Section size — the shared image is scaled to cover this box. */
  sw: number
  sh: number
}

/**
 * Measures where each card sits inside its section so every card can show
 * the matching "window" of one shared background image.
 *
 * Positions are derived from offsetLeft/offsetTop rather than
 * getBoundingClientRect so in-flight reveal transforms (translateY) never
 * skew the mask. The section must be `position: relative`.
 */
export function useMaskPositions(
  sectionRef: RefObject<HTMLElement | null>,
  cardsRef: RefObject<(HTMLElement | null)[]>,
  count: number,
): MaskPosition[] {
  const [positions, setPositions] = useState<MaskPosition[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const measure = () => {
      const sw = section.clientWidth
      const sh = section.clientHeight
      const next: MaskPosition[] = []
      for (let i = 0; i < count; i++) {
        const card = cardsRef.current[i]
        let x = 0
        let y = 0
        let el: HTMLElement | null = card
        while (el && el !== section) {
          x += el.offsetLeft
          y += el.offsetTop
          el = el.offsetParent as HTMLElement | null
        }
        next.push({ x, y, sw, sh })
      }
      setPositions(next)
    }

    // ResizeObserver fires once on observe, which covers the initial measure.
    const ro = new ResizeObserver(measure)
    ro.observe(section)
    cardsRef.current.slice(0, count).forEach((card) => card && ro.observe(card))

    // Web fonts can reflow the cards after first paint.
    document.fonts?.ready.then(measure).catch(() => {})

    return () => ro.disconnect()
  }, [sectionRef, cardsRef, count])

  return positions
}
