import { useId, useRef, useState, type KeyboardEvent } from 'react'
import type { FAQ } from '../data/faqs'

interface FAQAccordionProps {
  items: FAQ[]
  /** Index of the item open on first render; -1 for none. */
  defaultOpen?: number
}

/**
 * WAI-ARIA accordion: one panel open at a time, Up/Down/Home/End move
 * between headers. Height animates with the CSS grid 0fr → 1fr technique,
 * so no animation library is needed.
 */
export default function FAQAccordion({ items, defaultOpen = 0 }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number>(defaultOpen)
  const baseId = useId()
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = items.length
    let next: number | null = null
    switch (e.key) {
      case 'ArrowDown':
        next = (index + 1) % count
        break
      case 'ArrowUp':
        next = (index - 1 + count) % count
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = count - 1
        break
    }
    if (next !== null) {
      e.preventDefault()
      buttonsRef.current[next]?.focus()
    }
  }

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const headerId = `${baseId}-h-${index}`
        const panelId = `${baseId}-p-${index}`
        return (
          <div key={item.id} className={index > 0 ? 'border-t border-black/10' : ''}>
            <h3>
              <button
                ref={(el) => {
                  buttonsRef.current[index] = el
                }}
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className="flex w-full items-center justify-between gap-6 px-4 py-4 text-left transition-colors duration-300 hover:bg-white md:px-6 md:py-5"
              >
                <span className="text-base leading-tight font-bold text-black md:text-xl">{item.question}</span>
                <span
                  aria-hidden="true"
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black transition-[background-color,color,rotate] duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] md:h-11 md:w-11 ${
                    isOpen ? 'rotate-45 bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              inert={!isOpen}
              aria-hidden={!isOpen}
              className="grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="px-4 pb-5 text-sm leading-relaxed text-black/75 md:px-6 md:pb-6 md:text-base">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
