import { useRef } from 'react'
import ArrowIcon from '../components/ArrowIcon'
import MaskedCard from '../components/MaskedCard'
import { useBooking } from '../context/BookingContext'
import { clinic, images } from '../data/clinic'
import { galleryHighlights, treatments } from '../data/treatments'
import { useImageSize } from '../hooks/useImageSize'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMaskPositions } from '../hooks/useMaskPositions'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

const highlights = galleryHighlights
  .map((id) => treatments.find((t) => t.id === id))
  .filter((t): t is NonNullable<typeof t> => Boolean(t))

/**
 * Four-card mosaic over one photograph with a strip of treatment tiles.
 * All copy sits on frosted surfaces so it stays legible whatever part of
 * the photo a given viewport reveals.
 */
export default function SmileGallery() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const isMobile = useIsMobile()
  const { requestTreatment } = useBooking()

  const positions = useMaskPositions(sectionRef, cardsRef, 4)
  const imageSize = useImageSize(images.gallery.src)
  const { containerRef, getAnimStyle } = useStaggeredReveal(4)
  const focalX = isMobile ? 0.65 : 0.8

  const setRefs = (el: HTMLElement | null) => {
    sectionRef.current = el
    containerRef.current = el
  }

  const shared = { bgImage: images.gallery.src, imageSize, focalX }

  return (
    <section
      id="gallery"
      ref={setRefs}
      aria-labelledby="gallery-heading"
      className="section-shell relative overflow-hidden md:min-h-svh"
    >
      <span className="sr-only">{images.gallery.alt}</span>

      <div className="grid flex-1 grid-cols-1 gap-1.5 md:grid-cols-2 md:grid-rows-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(200px,0.8fr)] md:gap-2">
        {/* 0 — Smile Gallery */}
        <MaskedCard
          {...shared}
          position={positions[0]}
          cardRef={(el) => {
            cardsRef.current[0] = el
          }}
          style={getAnimStyle(0)}
          className="card-r relative min-h-[220px] overflow-hidden md:min-h-0"
        >
          <div className="glass absolute top-3 left-3 z-10 rounded-xl px-4 py-3 md:top-4 md:left-4 md:rounded-2xl md:px-5 md:py-4">
            <p className="label text-neutral-500">01 — Gallery</p>
            <h2 id="gallery-heading" className="mt-1 text-2xl leading-none font-bold md:text-3xl">
              Smile Gallery
            </h2>
          </div>
          <p className="glass absolute bottom-3 left-3 z-10 rounded-full px-3.5 py-1.5 text-xs font-semibold md:bottom-4 md:left-4 md:text-sm">
            Our cosmetic dental work
          </p>
        </MaskedCard>

        {/* 1 — Tall right card */}
        <MaskedCard
          {...shared}
          position={positions[1]}
          cardRef={(el) => {
            cardsRef.current[1] = el
          }}
          style={getAnimStyle(1)}
          className="card-r relative min-h-[300px] overflow-hidden md:row-span-2 md:min-h-0"
        >
          <div className="glass absolute right-3 bottom-3 left-3 z-10 flex items-center justify-between gap-4 rounded-xl p-2 pl-4 md:right-4 md:bottom-4 md:left-4 md:rounded-2xl md:p-3 md:pl-5">
            <p className="text-xs leading-snug font-semibold md:text-sm">
              If you want a gorgeous smile,
              <br className="hidden sm:block" /> call us to ask about a smile makeover.
            </p>
            <a href={clinic.phoneHref} className="pill pill-black shrink-0 px-5 py-3 text-sm md:px-6 md:py-3.5 md:text-base">
              Call Us
            </a>
          </div>
        </MaskedCard>

        {/* 2 — Smile makeover */}
        <MaskedCard
          {...shared}
          position={positions[2]}
          cardRef={(el) => {
            cardsRef.current[2] = el
          }}
          style={getAnimStyle(2)}
          className="card-r relative min-h-[220px] overflow-hidden md:min-h-0"
        >
          <div className="glass absolute bottom-3 left-3 z-10 rounded-xl px-4 py-3 md:bottom-4 md:left-4 md:rounded-2xl md:px-5 md:py-4">
            <h3 className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.9] font-bold tracking-[-0.03em]">
              Smile
              <br />
              makeover
            </h3>
          </div>
        </MaskedCard>

        {/* 3 — Treatment tiles */}
        <MaskedCard
          {...shared}
          position={positions[3]}
          cardRef={(el) => {
            cardsRef.current[3] = el
          }}
          style={getAnimStyle(3)}
          className="card-r relative col-span-1 min-h-[220px] overflow-hidden md:col-span-2 md:min-h-0"
        >
          <ul className="absolute inset-0 z-10 grid grid-cols-2 gap-1.5 p-1.5 md:grid-cols-4 md:gap-2 md:p-2" role="list">
            {highlights.map((t, i) => {
              const active = i === 0
              return (
                <li key={t.id} className="flex">
                  <a
                    href="#contact"
                    onClick={() => requestTreatment(t.title)}
                    aria-label={`${t.title} — enquire about this treatment`}
                    className={`group card-r flex w-full flex-col justify-between p-3 transition-[background-color,translate] duration-300 hover:-translate-y-0.5 md:p-4 lg:p-5 ${
                      active ? 'glass hover:bg-white' : 'glass-dark hover:bg-black/40'
                    }`}
                  >
                    <h4 className="text-base leading-[1.05] font-bold tracking-[-0.02em] whitespace-pre-line [overflow-wrap:anywhere] sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
                      {t.short}
                    </h4>
                    <span className="mt-3 flex items-end justify-between">
                      <span className="text-[11px] font-semibold opacity-60">{String(i + 1).padStart(2, '0')}</span>
                      <span className={`arrow-btn h-8 w-8 md:h-9 md:w-9 ${active ? 'arrow-btn-black' : 'arrow-btn-white'}`}>
                        <ArrowIcon size={12} />
                      </span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </MaskedCard>
      </div>
    </section>
  )
}
