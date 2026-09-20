import ArrowIcon from '../components/ArrowIcon'
import { useBooking } from '../context/BookingContext'
import { treatments } from '../data/treatments'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

/** Numbered list of every treatment. Each row pre-selects itself in the form. */
export default function Services() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(2)
  const { requestTreatment } = useBooking()

  return (
    <section id="services" ref={containerRef} aria-labelledby="services-heading" className="section-shell relative">
      <div className="grid grid-cols-1 gap-1.5 md:gap-2 lg:grid-cols-[1fr_1.6fr]">
        <div
          className="card-r fill-mid flex min-h-[220px] flex-col justify-between p-5 md:p-7 lg:sticky lg:top-20 lg:h-[calc(100svh-5.5rem)]"
          style={getAnimStyle(0)}
        >
          <div className="flex items-start justify-between">
            <p className="label text-neutral-500">04 — Services</p>
            <span className="text-xs font-semibold text-neutral-500 md:text-sm">{String(treatments.length).padStart(2, '0')}</span>
          </div>
          <div>
            <h2 id="services-heading" className="text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.92] font-bold text-black">
              Complete
              <br />
              care for
              <br />
              every smile.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-600 md:mt-6">
              From routine check-ups to implants and orthodontics — select a treatment to enquire.
            </p>
          </div>
        </div>

        <ul className="card-r fill-soft overflow-hidden" role="list" style={getAnimStyle(1)}>
          {treatments.map((t, i) => (
            <li key={t.id} className={i > 0 ? 'border-t border-black/10' : ''}>
              <a
                href="#contact"
                onClick={() => requestTreatment(t.title)}
                aria-label={`${t.title} — enquire about this treatment`}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-4 transition-colors duration-300 hover:bg-white md:px-7 md:py-6 lg:grid-cols-[3.5rem_1fr_1fr_auto] lg:gap-6"
              >
                <span className="text-xs font-semibold text-neutral-400 tabular-nums md:text-sm">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-xl leading-[1.05] font-bold text-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 md:text-3xl">{t.title}</h3>
                <p className="col-span-3 col-start-2 text-sm text-neutral-600 lg:col-span-1 lg:col-start-auto">{t.description}</p>
                <span className="arrow-btn arrow-btn-black col-start-3 row-start-1 md:h-12 md:w-12 lg:col-start-auto lg:row-start-auto">
                  <ArrowIcon />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
