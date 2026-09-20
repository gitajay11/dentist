import ArrowIcon from '../components/ArrowIcon'
import { images } from '../data/clinic'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

/**
 * Two-column bento: heading, two procedure images and a consultation card
 * on the left; a tall portrait with two overlay cards on the right.
 */
export default function ImplantDentistry() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(4)

  return (
    <section
      id="implants"
      ref={containerRef}
      aria-labelledby="implants-heading"
      className="section-shell relative overflow-hidden md:min-h-svh"
    >
      <div className="grid flex-1 grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
        {/* Left column */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          <div
            className="card-r fill-soft flex flex-[1.2] flex-col justify-between p-5 md:min-h-0 md:p-7"
            style={getAnimStyle(0)}
          >
            <div>
              <p className="label mb-4 text-neutral-500">02 — Implants</p>
              <h2 id="implants-heading" className="text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.92] font-bold text-black">
              Implant
              <br />
              Dentistry
              </h2>
            </div>
            <p className="mt-6 text-xs font-semibold text-black md:text-sm">Restore Missing Teeth</p>
          </div>

          <div className="flex min-h-[160px] flex-1 gap-1.5 md:min-h-[200px] md:gap-2" style={getAnimStyle(1)}>
            <div className="card-r flex-1 overflow-hidden">
              <img
                src={images.implantProcedure.src}
                alt={images.implantProcedure.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="card-r flex-1 overflow-hidden">
              <img
                src={images.implantRestoration.src}
                alt={images.implantRestoration.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            className="card-r fill-mid flex flex-[0.8] flex-wrap items-end justify-between gap-4 p-5 md:min-h-0 md:p-7"
            style={getAnimStyle(2)}
          >
            <div>
              <p className="label mb-2 text-neutral-500 md:mb-3">Consultation</p>
              <h3 className="text-xl leading-6 font-bold text-black md:text-3xl md:leading-8">
                Dental
                <br />
                Restoration
                <br />
                Services
              </h3>
            </div>
            <a href="#contact" className="pill pill-white shrink-0 px-5 py-3 text-sm lg:px-8 lg:py-5 lg:text-xl">
              Book Online
            </a>
          </div>
        </div>

        {/* Right column */}
        <div className="card-r relative min-h-[360px] overflow-hidden md:min-h-[520px]" style={getAnimStyle(3)}>
          <img
            src={images.implantPatient.src}
            alt={images.implantPatient.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />

          <div className="absolute right-3 bottom-3 left-3 flex gap-1.5 md:right-5 md:bottom-5 md:left-5 md:gap-2">
            <a
              href="#faq"
              className="card-r group glass flex h-36 flex-1 flex-col justify-between p-3 md:h-52 md:p-5"
            >
              <h4 className="text-lg leading-5 font-bold text-black md:text-2xl md:leading-7">
                The Process
                <br />
                of Installing
                <br />
                Implants
              </h4>
              <span className="arrow-btn arrow-btn-black self-end md:h-12 md:w-12">
                <ArrowIcon />
              </span>
            </a>
            <a
              href="#faq"
              className="card-r group glass-dark flex h-36 flex-1 flex-col justify-between p-3 md:h-52 md:p-5"
            >
              <h4 className="text-lg leading-5 font-bold text-white md:text-2xl md:leading-7">
                Caring
                <br />
                for Dental
                <br />
                Implants
              </h4>
              <span className="arrow-btn arrow-btn-white self-end md:h-12 md:w-12">
                <ArrowIcon />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
