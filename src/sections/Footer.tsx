import { useSyncExternalStore } from 'react'
import ArrowIcon from '../components/ArrowIcon'
import { clinic, navLinks } from '../data/clinic'
import { treatments } from '../data/treatments'

const legalLinks = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
]

/* Live local time for the clinic — updates once a minute. */
const clockFormat = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
const subscribeClock = (onChange: () => void) => {
  const id = window.setInterval(onChange, 30_000)
  return () => window.clearInterval(id)
}
const readClock = () => clockFormat.format(new Date())
const readClockServer = () => ''

export default function Footer() {
  const year = new Date().getFullYear()
  const time = useSyncExternalStore(subscribeClock, readClock, readClockServer)
  const wordmark = clinic.wordmark.join(' ').toUpperCase()
  const ticker = treatments.map((t) => t.title)

  return (
    <footer className="section-shell relative" aria-labelledby="footer-heading">
      <div className="card-r relative overflow-hidden bg-black text-white">
        <h2 id="footer-heading" className="sr-only">
          Site footer
        </h2>

        {/* ---- CTA + link columns ---- */}
        <div className="grid gap-10 p-5 md:grid-cols-12 md:gap-8 md:p-7 lg:gap-12 lg:p-9">
          <div className="flex flex-col justify-between gap-8 md:col-span-5">
            <div>
              <img
                src={clinic.logoLarge}
                alt={`${clinic.name} logo`}
                width={72}
                height={72}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 rounded-full md:h-[72px] md:w-[72px]"
              />
              <p className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-bold tracking-[-0.02em]">
                Modern dentistry.
                <br />
                Thoughtful care.
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                Request an appointment online and our team will confirm a time that suits you — or call us during
                opening hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#contact" className="group pill pill-white gap-3 py-2 pr-2 pl-5 text-sm">
                Book Appointment
                <span className="arrow-btn arrow-btn-black h-8 w-8 md:h-8 md:w-8">
                  <ArrowIcon size={12} />
                </span>
              </a>
              <a
                href={clinic.phoneHref}
                className="pill border border-white/30 px-5 py-3 text-sm text-white transition-colors duration-300 hover:bg-white hover:text-black"
              >
                Call the Clinic
              </a>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-7" aria-label="Footer">
            <div>
              <p className="label mb-4 text-white/50">Explore</p>
              <ul className="space-y-2.5" role="list">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-300 hover:text-white/70"
                    >
                      <span className="link-underline">{l.label}</span>
                      <span className="-translate-x-1 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowIcon size={10} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label mb-4 text-white/50">Contact</p>
              <ul className="space-y-2.5 text-sm font-semibold" role="list">
                <li>
                  <a href={clinic.phoneHref} className="link-underline">
                    {clinic.phone}
                  </a>
                </li>
                <li>
                  <a href={clinic.emailHref} className="link-underline [overflow-wrap:anywhere]">
                    {clinic.email}
                  </a>
                </li>
                <li className="pt-1 text-white/60">
                  {clinic.address.line1}
                  <br />
                  {clinic.address.line2}
                </li>
              </ul>
              {time && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/70">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 [animation-duration:2.4s]" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  {clinic.city} · {time} IST
                </p>
              )}
            </div>

            <div>
              <p className="label mb-4 text-white/50">Hours</p>
              <ul className="space-y-2.5 text-sm" role="list">
                {clinic.hours.map((h) => (
                  <li key={h.days} className="flex flex-col">
                    <span className="font-semibold">{h.days}</span>
                    <span className="text-white/60">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="label mt-7 mb-4 text-white/50">Legal</p>
              <ul className="space-y-2.5" role="list">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="link-underline text-sm font-semibold">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* ---- Treatments ticker (pauses on hover) ---- */}
        <div className="group border-y border-white/10 py-3.5" aria-hidden="true">
          <div className="flex w-max animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="flex items-center text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                <span className="px-6">{t}</span>
                <span className="text-white/30">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ---- Wordmark: letters spread edge-to-edge at any width; hover lifts each letter ---- */}
        <div className="px-5 pt-8 md:px-7 md:pt-10 lg:px-9">
          <p
            aria-label={clinic.name}
            className="flex cursor-default justify-between text-[clamp(2.5rem,12.5vw,16rem)] leading-[0.82] font-bold tracking-[-0.04em] select-none"
          >
            {wordmark.split('').map((ch, i) =>
              ch === ' ' ? (
                <span key={i} aria-hidden="true" className="w-[0.25em]" />
              ) : (
                <span
                  key={i}
                  aria-hidden="true"
                  className="inline-block transition-[translate,color] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[0.08em] hover:text-white/55"
                >
                  {ch}
                </span>
              ),
            )}
          </p>
        </div>

        {/* ---- Bottom bar ---- */}
        <div className="mx-5 mt-6 flex flex-col gap-4 border-t border-white/10 py-4 text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between md:mx-7 md:text-xs lg:mx-9">
          <p>
            © {year} {clinic.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href} className="link-underline font-semibold text-white/80">
                {l.label}
              </a>
            ))}
            <a href="#home" aria-label="Back to top" className="arrow-btn arrow-btn-white h-9 w-9 md:h-9 md:w-9">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 12V2m0 0L2.5 6.5M7 2l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
