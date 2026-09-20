import FAQAccordion from '../components/FAQAccordion'
import { clinic } from '../data/clinic'
import { faqs } from '../data/faqs'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

export default function FAQ() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(2)

  return (
    <section id="faq" ref={containerRef} aria-labelledby="faq-heading" className="section-shell relative">
      <div className="grid grid-cols-1 gap-1.5 md:gap-2 lg:grid-cols-[1fr_1.6fr]">
        <div
          className="card-r fill-mid flex min-h-[220px] flex-col justify-between p-5 md:p-7 lg:sticky lg:top-20 lg:h-[calc(100svh-5.5rem)]"
          style={getAnimStyle(0)}
        >
          <p className="label text-neutral-500">08 — FAQ</p>
          <div>
            <h2 id="faq-heading" className="text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.92] font-bold text-black">
              Questions,
              <br />
              answered.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-600 md:mt-6">
              Practical answers to what patients ask most. Still unsure? Call us.
            </p>
            <a href={clinic.phoneHref} className="pill pill-white pill-lg mt-5 md:mt-6">
              Call Us
            </a>
          </div>
        </div>

        <div className="card-r fill-soft overflow-hidden" style={getAnimStyle(1)}>
          <FAQAccordion items={faqs} />
        </div>
      </div>
    </section>
  )
}
