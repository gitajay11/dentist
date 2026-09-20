import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { navLinks } from '../data/clinic'
import { useActiveSection } from '../hooks/useActiveSection'
import MenuOverlay from './MenuOverlay'
import Wordmark from './Wordmark'

const EASE = 'ease-[cubic-bezier(0.76,0,0.24,1)]'

/**
 * Floating header: wordmark, a frosted pill of section links with a
 * sliding active state (desktop), booking CTA, and a burger that opens
 * the full-screen menu. Gains a hairline + blur once the page scrolls.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const openerRef = useRef<HTMLElement | null>(null)

  const sectionIds = useMemo(() => navLinks.map((l) => l.href.slice(1)), [])
  const active = useActiveSection(sectionIds, 'home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    openerRef.current = e.currentTarget
    setOpen((o) => !o)
  }

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${EASE} ${
          scrolled
            ? 'border-b border-black/5 bg-white/75 shadow-[0_1px_0_rgb(0_0_0_/_0.03)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-3 py-3 md:px-5">
          <Wordmark />

          {/* Desktop pill navigation */}
          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-black/10 bg-white/70 p-1 shadow-[0_8px_30px_-16px_rgb(0_0_0_/_0.35)] backdrop-blur-xl lg:flex"
          >
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1)
              const isHome = link.href === '#home'
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`rounded-full px-3 py-2 text-[13px] font-semibold transition-[background-color,color] duration-400 xl:px-4 ${EASE} ${
                    isHome ? 'hidden xl:inline-flex' : ''
                  } ${isActive ? 'bg-black text-white' : 'text-black hover:bg-black/[0.06]'}`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#contact" className="pill pill-black hidden px-5 py-2.5 text-[13px] sm:inline-flex">
              Book Appointment
            </a>

            {/* Burger — also available on desktop for the full menu (contact, hours) */}
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 backdrop-blur-xl transition-colors duration-300 hover:bg-black [&:hover_span]:bg-white"
            >
              <span className={`absolute h-0.5 w-5 -translate-y-[5px] rounded-full bg-black transition-all duration-300 ${EASE}`} />
              <span className={`absolute h-0.5 w-5 rounded-full bg-black transition-all duration-300 ${EASE}`} />
              <span className={`absolute h-0.5 w-5 translate-y-[5px] rounded-full bg-black transition-all duration-300 ${EASE}`} />
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} openerRef={openerRef} />
    </>
  )
}
