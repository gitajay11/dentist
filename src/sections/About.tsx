import ArrowIcon from '../components/ArrowIcon'
import { stats } from '../data/clinic'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

export default function About() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(6)

  return (
    <section id="about" ref={containerRef} aria-labelledby="about-heading" className="section-shell relative">
      {/* Copy */}
      <div
        className="card-r fill-soft grid grid-cols-1 gap-8 p-5 md:grid-cols-2 md:gap-12 md:p-7 lg:p-9"
        style={getAnimStyle(0)}
      >
        <div>
          <p className="label mb-5 text-neutral-500">03 — About the clinic</p>
          <h2 id="about-heading" className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.92] font-bold text-black">
            Dentistry
            <br />
            designed
            <br />
            around you.
          </h2>
        </div>
        <div className="flex flex-col justify-end">
          <div className="max-w-lg space-y-3 text-sm leading-relaxed text-neutral-600 md:text-base">
            <p>
              Every visit begins with listening. We take time to understand your concerns, your history and your
              goals, so that each treatment plan is genuinely personal rather than one-size-fits-all.
            </p>
            <p>
              Modern dentistry in a calm, comfortable environment — from digital diagnostics to gentle techniques —
              with prevention at the centre of everything we do, so your natural teeth last.
            </p>
          </div>
          <a href="#doctors" className="group mt-6 inline-flex items-center gap-3 text-sm font-semibold text-black md:mt-8">
            Meet our team
            <span className="arrow-btn arrow-btn-black">
              <ArrowIcon />
            </span>
          </a>
        </div>
      </div>

      {/* Stats */}
      <ul className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2" role="list" aria-label="Clinic at a glance">
        {stats.map((s, i) => (
          <li
            key={s.label}
            className="card-r fill-mid flex min-h-[140px] flex-col justify-between p-4 md:min-h-[190px] md:p-6"
            style={getAnimStyle(1 + i)}
          >
            <span className="text-[clamp(2.25rem,4.5vw,4rem)] leading-none font-bold tracking-[-0.03em] text-black">
              {s.value}
            </span>
            <span className="text-xs font-semibold text-neutral-600 md:text-sm">{s.label}</span>
          </li>
        ))}
      </ul>
      <p className="px-2 pt-1 text-[11px] font-medium text-neutral-500" style={getAnimStyle(5)}>
        * Figures shown are placeholders pending verified clinic data.
      </p>
    </section>
  )
}
