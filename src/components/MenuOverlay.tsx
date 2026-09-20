import { useEffect, useRef, type MouseEvent, type RefObject } from 'react'
import { clinic, navLinks } from '../data/clinic'
import { useScrollLock } from '../hooks/useScrollLock'
import ArrowIcon from './ArrowIcon'
import Wordmark from './Wordmark'

interface MenuOverlayProps {
  open: boolean
  onClose: () => void
  /** Element that opened the menu — focus returns to it on close. */
  openerRef: RefObject<HTMLElement | null>
}

const EASE = 'ease-[cubic-bezier(0.76,0,0.24,1)]'

/**
 * Full-screen menu: numbered typographic links on the left, contact and
 * booking on the right. Pure CSS transitions; focus-trapped while open.
 */
export default function MenuOverlay({ open, onClose, openerRef }: MenuOverlayProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null)

  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const opener = openerRef.current
    const id = window.setTimeout(() => firstLinkRef.current?.focus(), 350)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && rootRef.current) {
        const focusables = rootRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [open, onClose, openerRef])

  // Body is scroll-locked while open (blocks the native anchor jump):
  // close first, then scroll once the lock is released.
  const navigate = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    onClose()
    window.setTimeout(() => {
      const target = document.getElementById(href.slice(1))
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      history.replaceState(null, '', href)
    }, 60)
  }

  const stagger = (i: number) => ({ transitionDelay: open ? `${120 + i * 50}ms` : '0ms' })
  const item = `transition-[opacity,translate] duration-500 ${EASE} ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`

  return (
    <div
      id="site-menu"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] flex flex-col bg-white transition-[opacity,translate] duration-500 ${EASE} ${
        open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
    >
      {/* Top bar mirrors the header so the close button sits where the burger was */}
      <div className="flex items-center justify-between px-3 py-3 md:px-5">
        <Wordmark onClick={(e) => navigate(e, '#home')} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-colors duration-300 hover:bg-black hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-3 pt-2 pb-6 md:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] md:items-start md:gap-6 md:px-5 md:pt-4 lg:gap-10">
        {/* Links — top-aligned with the contact card so both columns share a baseline */}
        <nav aria-label="Menu" className="flex flex-col md:px-2 md:pt-7">
          <p className="label mb-3 text-neutral-400">Navigate</p>
          <ol className="border-t border-black/10">
            {navLinks.map((link, i) => (
              <li key={link.href} className="border-b border-black/10" style={stagger(i)}>
                <a
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={link.href}
                  onClick={(e) => navigate(e, link.href)}
                  tabIndex={open ? 0 : -1}
                  className={`group flex items-center justify-between gap-6 py-2.5 md:py-3 ${item}`}
                >
                  <span className="flex items-center gap-4 md:gap-5">
                    <span className="w-5 text-[10px] font-semibold text-neutral-400 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[clamp(1.5rem,2.6vw,2.125rem)] leading-none font-bold tracking-[-0.03em] text-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                      {link.label}
                    </span>
                  </span>
                  <span className="arrow-btn arrow-btn-black h-8 w-8 -translate-x-2 opacity-0 transition-[opacity,translate,background-color,color] duration-500 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:h-9 md:w-9">
                    <ArrowIcon size={12} />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Contact + booking */}
        <aside
          className={`card-r fill-soft flex flex-col gap-8 p-5 md:p-7 ${item}`}
          style={stagger(navLinks.length)}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-1">
            <div>
              <p className="label text-neutral-500">Visit</p>
              <p className="mt-1.5 text-sm font-semibold">
                {clinic.address.line1}
                <br />
                {clinic.address.line2}
              </p>
            </div>
            <div>
              <p className="label text-neutral-500">Hours</p>
              <p className="mt-1.5 text-sm font-semibold">
                {clinic.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.time}
                  </span>
                ))}
              </p>
            </div>
            <div>
              <p className="label text-neutral-500">Call</p>
              <a href={clinic.phoneHref} tabIndex={open ? 0 : -1} className="link-underline mt-1.5 inline-block text-sm font-semibold">
                {clinic.phone}
              </a>
            </div>
            <div>
              <p className="label text-neutral-500">Email</p>
              <a href={clinic.emailHref} tabIndex={open ? 0 : -1} className="link-underline mt-1.5 inline-block text-sm font-semibold">
                {clinic.email}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href="#contact"
              onClick={(e) => navigate(e, '#contact')}
              tabIndex={open ? 0 : -1}
              className="pill pill-black w-full px-6 py-4 text-sm"
            >
              Book Appointment
            </a>
            <a href={clinic.phoneHref} tabIndex={open ? 0 : -1} className="pill pill-outline w-full px-6 py-4 text-sm">
              {clinic.offersEmergencyCare ? 'Dental Emergency — Call' : 'Call the Clinic'}
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
