import { clinic, navLinks } from '../data/clinic'

const legalLinks = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="section-shell relative" aria-labelledby="footer-heading">
      <div className="card-r flex flex-col justify-between bg-black p-5 text-white md:min-h-[60vh] md:p-7">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <h2 id="footer-heading" className="sr-only">
              Site footer
            </h2>
            <p className="text-sm font-semibold">
              Modern dentistry.
              <br />
              Thoughtful care.
            </p>
            <p className="mt-6 max-w-xs text-xs text-white/60 md:text-sm">
              {clinic.address.line1}
              <br />
              {clinic.address.line2}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-6 sm:grid-cols-3" aria-label="Footer">
            <div>
              <p className="label mb-3 text-white/50">Explore</p>
              <ul className="space-y-2" role="list">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm font-semibold underline-offset-4 hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label mb-3 text-white/50">Contact</p>
              <ul className="space-y-2 text-sm font-semibold" role="list">
                <li>
                  <a href={clinic.phoneHref} className="underline-offset-4 hover:underline">
                    {clinic.phone}
                  </a>
                </li>
                <li>
                  <a href={clinic.emailHref} className="[overflow-wrap:anywhere] underline-offset-4 hover:underline">
                    {clinic.email}
                  </a>
                </li>
                {clinic.hours.map((h) => (
                  <li key={h.days} className="text-white/60">
                    {h.days}: {h.time}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label mb-3 text-white/50">Legal</p>
              <ul className="space-y-2" role="list">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm font-semibold underline-offset-4 hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-14 md:mt-20">
          <p
            aria-hidden="true"
            className="text-[clamp(3.5rem,14vw,13rem)] leading-[0.8] font-bold tracking-tight uppercase"
          >
            {clinic.wordmark[0]}
            <br />
            {clinic.wordmark[1]}
          </p>
          <div className="mt-6 flex flex-col gap-2 border-t border-white/15 pt-4 text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between md:text-xs">
            <p>
              © {year} {clinic.name}. All rights reserved.
            </p>
            <a href="#home" className="font-semibold text-white underline-offset-4 hover:underline">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
