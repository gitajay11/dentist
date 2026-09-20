import type { MouseEvent } from 'react'
import { clinic } from '../data/clinic'

interface WordmarkProps {
  className?: string
  /** Use on dark backgrounds. */
  inverted?: boolean
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

/** Logo mark + two-line stacked wordmark with the tagline beneath. */
export default function Wordmark({ className = '', inverted = false, onClick }: WordmarkProps) {
  const [line1, line2] = clinic.wordmark
  const ink = inverted ? 'text-white' : 'text-black'
  return (
    <a
      href="#home"
      onClick={onClick}
      aria-label={`${clinic.name} — home`}
      className={`group/wm inline-flex items-center gap-2.5 rounded-lg ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-[11px] font-extrabold tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/wm:-rotate-6 ${
          inverted ? 'bg-white text-black' : 'bg-black text-white'
        }`}
      >
        {line1[0]}
        {line2[0]}
      </span>
      <span className="flex flex-col">
        <span className={`text-[1.05rem] leading-[0.92] font-extrabold tracking-[-0.03em] uppercase md:text-[1.2rem] ${ink}`}>
          {line1}
          <br />
          {line2}
        </span>
        <span className={`mt-1 text-[8px] leading-none font-semibold tracking-[0.18em] uppercase md:text-[9px] ${inverted ? 'text-white/60' : 'text-neutral-500'}`}>
          {clinic.tagline}
        </span>
      </span>
    </a>
  )
}
