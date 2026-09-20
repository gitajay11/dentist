import ArrowIcon from '../components/ArrowIcon'
import { doctors } from '../data/doctors'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

export default function Doctors() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(1 + doctors.length)

  return (
    <section id="doctors" ref={containerRef} aria-labelledby="doctors-heading" className="section-shell relative">
      <div
        className="card-r fill-soft flex flex-col justify-between gap-6 p-5 md:flex-row md:items-end md:p-7"
        style={getAnimStyle(0)}
      >
        <div>
          <p className="label mb-4 text-neutral-500">05 — Our dentists</p>
          <h2 id="doctors-heading" className="text-[clamp(1.75rem,6vw,5.5rem)] leading-[0.92] font-bold text-black">
            Experienced hands.
            <br />
            Compassionate care.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-neutral-600 md:text-right">
          Specialists who take the time to listen, explain, and care for you as an individual.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 md:gap-2" role="list">
        {doctors.map((d, i) => (
          <li key={d.id} style={getAnimStyle(1 + i)}>
            <article className="card-r group relative aspect-[4/5] overflow-hidden">
              <img
                src={d.image.src}
                alt={d.image.alt}
                loading="lazy"
                decoding="async"
                width={800}
                height={1000}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="glass-dark absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold md:top-5 md:left-5">
                {d.specialty}
              </span>
              <div className="card-r glass absolute right-3 bottom-3 left-3 flex items-end justify-between gap-3 p-3 md:right-5 md:bottom-5 md:left-5 md:p-5">
                <div className="min-w-0">
                  <h3 className="text-lg leading-5 font-bold text-black lg:text-2xl lg:leading-7">{d.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-neutral-600">{d.credentials}</p>
                  <p className="text-[11px] text-neutral-500">{d.experience} of experience</p>
                </div>
                <a
                  href="#contact"
                  aria-label={`Book a consultation with ${d.name}`}
                  className="arrow-btn arrow-btn-black md:h-12 md:w-12"
                >
                  <ArrowIcon />
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
