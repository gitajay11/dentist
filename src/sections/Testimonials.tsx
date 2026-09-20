import { testimonials } from '../data/testimonials'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

export default function Testimonials() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(1 + testimonials.length)

  return (
    <section id="stories" ref={containerRef} aria-labelledby="stories-heading" className="section-shell relative">
      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2 lg:grid-cols-4">
        <div
          className="card-r fill-soft flex min-h-[200px] flex-col justify-between p-5 md:min-h-0 md:p-7"
          style={getAnimStyle(0)}
        >
          <p className="label text-neutral-500">07 — Patient stories</p>
          <h2 id="stories-heading" className="text-[clamp(1.75rem,3vw,3.25rem)] leading-[0.95] font-bold text-black">
            Care that patients remember.
          </h2>
        </div>

        {testimonials.map((t, i) => (
          <figure
            key={t.id}
            className="card-r fill-mid flex min-h-[260px] flex-col justify-between p-5 md:min-h-[360px] md:p-7"
            style={getAnimStyle(1 + i)}
          >
            <blockquote>
              <p className="text-lg leading-snug font-bold tracking-[-0.01em] text-black md:text-xl lg:text-2xl">“{t.quote}”</p>
            </blockquote>
            <figcaption className="mt-8 flex items-center justify-between gap-3 text-xs font-semibold text-black md:text-sm">
              <span>— {t.name}</span>
              <span className="text-neutral-500">{t.treatment}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="px-2 pt-1 text-[11px] font-medium text-neutral-500">
        Sample testimonials shown for layout purposes only — to be replaced with consented patient feedback.
      </p>
    </section>
  )
}
