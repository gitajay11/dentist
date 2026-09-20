import { useRef } from 'react'
import ArrowIcon from '../components/ArrowIcon'
import MaskedCard from '../components/MaskedCard'
import { clinic, images } from '../data/clinic'
import { useImageSize } from '../hooks/useImageSize'
import { useIsMobile } from '../hooks/useIsMobile'
import { useMaskPositions } from '../hooks/useMaskPositions'
import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

const featureBars = ['Advanced Dentistry', 'High Quality Equipment', 'Friendly Staff']

interface HeroProps {
  /** Hold the reveal until the splash screen has finished. */
  ready: boolean
}

/**
 * Full-viewport mosaic: three feature bars and one large card all show
 * windows into the same photograph.
 */
export default function Hero({ ready }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const isMobile = useIsMobile()

  const positions = useMaskPositions(sectionRef, cardsRef, 4)
  const imageSize = useImageSize(images.hero.src)
  const { containerRef, getAnimStyle } = useStaggeredReveal(4, 0.15, ready)
  const focalX = isMobile ? 0.7 : 0.8

  const setRefs = (el: HTMLElement | null) => {
    sectionRef.current = el
    containerRef.current = el
  }

  return (
    <section
      id="home"
      ref={setRefs}
      aria-label="Welcome"
      className="section-shell relative min-h-svh overflow-hidden pt-[4.75rem] md:pt-24"
    >
      {/* Accessible description of the shared photograph */}
      <span className="sr-only">{images.hero.alt}</span>

      {featureBars.map((label, i) => (
        <MaskedCard
          key={label}
          bgImage={images.hero.src}
          position={positions[i]}
          imageSize={imageSize}
          focalX={focalX}
          cardRef={(el) => {
            cardsRef.current[i] = el
          }}
          style={getAnimStyle(i)}
          className="card-r relative h-14 w-full shrink-0 overflow-hidden md:h-[4.5rem] lg:h-20"
        >
          <span className="relative z-10 flex h-full items-center justify-center text-center text-lg font-bold tracking-[-0.02em] text-black md:text-2xl lg:text-3xl">
            {label}
          </span>
        </MaskedCard>
      ))}

      <MaskedCard
        bgImage={images.hero.src}
        position={positions[3]}
        imageSize={imageSize}
        focalX={focalX}
        cardRef={(el) => {
          cardsRef.current[3] = el
        }}
        style={getAnimStyle(3)}
        className="card-r relative w-full flex-1 overflow-hidden"
      >
        {/* Flex column: the top note and the bottom block can never overlap;
            the heading also scales with viewport height so short screens fit. */}
        <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between p-4 md:p-6">
          <p className="max-w-[240px] text-[13px] leading-snug font-semibold text-black md:max-w-[320px] md:text-[15px]">
            We wish to provide professional dental services that match current technologies.
          </p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="glass mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold md:mb-4 md:text-xs">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-black" />
                Trusted Dentists in {clinic.city}
              </span>
              <h1 className="text-[clamp(3rem,min(11vw,15svh),11rem)] leading-[0.84] font-bold tracking-[-0.04em] text-black">
                Dental
                <br />
                Care
              </h1>
            </div>

            <a
              href="#contact"
              aria-label="Book a consultation"
              className="group pill glass shrink-0 gap-3 p-1.5 text-xs sm:py-2 sm:pr-2 sm:pl-5 md:text-sm"
            >
              <span className="hidden sm:inline">Book a Consultation</span>
              <span className="arrow-btn arrow-btn-black h-9 w-9">
                <ArrowIcon size={12} />
              </span>
            </a>
          </div>
        </div>
      </MaskedCard>
    </section>
  )
}
