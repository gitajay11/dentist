import { useStaggeredReveal } from '../hooks/useStaggeredReveal'

const steps = [
  { n: '01', title: 'Book', text: 'Choose a convenient appointment.' },
  { n: '02', title: 'Consult', text: 'Discuss your concerns with the dentist.' },
  { n: '03', title: 'Diagnose', text: 'Understand your dental condition clearly.' },
  { n: '04', title: 'Plan', text: 'Review suitable treatment options.' },
  { n: '05', title: 'Care', text: 'Begin your personalized treatment journey.' },
]

export default function PatientJourney() {
  const { containerRef, getAnimStyle } = useStaggeredReveal(1 + steps.length)

  return (
    <section id="journey" ref={containerRef} aria-labelledby="journey-heading" className="section-shell relative">
      <div
        className="card-r fill-soft flex flex-col justify-between gap-6 p-5 md:flex-row md:items-end md:p-7"
        style={getAnimStyle(0)}
      >
        <div>
          <p className="label mb-4 text-neutral-500">06 — Patient journey</p>
          <h2 id="journey-heading" className="text-[clamp(2rem,6vw,5.5rem)] leading-[0.92] font-bold text-black">
            Your visit,
            <br />
            made simple.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-neutral-600 md:text-right">
          Five clear steps from your first call to the start of care — with time for questions at every stage.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:gap-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <li
            key={s.n}
            className={`card-r flex min-h-[170px] flex-col justify-between p-4 md:min-h-[240px] md:p-5 ${
              i === 0 ? 'bg-black text-white' : 'fill-mid text-black'
            }`}
            style={getAnimStyle(1 + i)}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold md:h-11 md:w-11 md:text-sm ${
                i === 0 ? 'border-white' : 'border-black'
              }`}
            >
              {s.n}
            </span>
            <div>
              <h3 className="label mb-1.5">{s.title}</h3>
              <p className="text-lg leading-tight font-bold lg:text-xl xl:text-2xl">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
