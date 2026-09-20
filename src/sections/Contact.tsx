import AppointmentForm from '../components/AppointmentForm'
import ArrowIcon from '../components/ArrowIcon'
import { clinic } from '../data/clinic'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

const info = [
  { label: 'Visit Us', lines: [clinic.address.line1, clinic.address.line2] },
  { label: 'Call', lines: [clinic.phone], href: clinic.phoneHref },
  { label: 'Email', lines: [clinic.email], href: clinic.emailHref },
  { label: 'Opening Hours', lines: clinic.hours.map((h) => `${h.days}: ${h.time}`) },
]

/** Primary conversion section: black information card + the appointment form. */
export default function Contact() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(2)

  return (
    <section id="contact" ref={containerRef} aria-labelledby="contact-heading" className="section-shell relative">
      <div className="grid grid-cols-1 gap-1.5 md:min-h-svh md:grid-cols-2 md:gap-2">
        {/* Information */}
        <div
          className="card-r flex flex-col justify-between bg-black p-5 text-white md:p-7"
          style={getAnimStyle(0)}
        >
          <div>
            <p className="label mb-6 text-white/60">09 — Appointments</p>
            <h2 id="contact-heading" className="text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.92] font-bold">
              Ready to
              <br />
              take care of
              <br />
              your smile?
            </h2>
            <p className="mt-6 max-w-sm text-sm text-white/70 md:text-base">
              Request an appointment and our team will confirm a time that suits you. Prefer to talk? Call us during
              opening hours.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-x-6 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-2">
            {info.map((item) => (
              <div key={item.label}>
                <dt className="label text-white/60">{item.label}</dt>
                <dd className="mt-1.5 text-sm font-semibold md:text-base">
                  {item.href ? (
                    <a href={item.href} className="underline-offset-4 hover:underline">
                      {item.lines[0]}
                    </a>
                  ) : (
                    item.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href={clinic.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-3 self-start text-sm font-semibold"
          >
            Get directions
            <span className="arrow-btn arrow-btn-white">
              <ArrowIcon />
            </span>
          </a>
        </div>

        {/* Form */}
        <div className="card-r fill-soft flex flex-col p-5 md:p-7" style={getAnimStyle(1)}>
          <AppointmentForm />
        </div>
      </div>
    </section>
  )
}
