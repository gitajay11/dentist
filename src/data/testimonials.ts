/**
 * Patient stories — SAMPLE PLACEHOLDERS for layout only.
 * Replace with genuine, consented patient feedback before launch.
 */
export interface Testimonial {
  id: string
  quote: string
  name: string
  treatment: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'The entire team made me feel comfortable from consultation to treatment. Everything was explained clearly before we began.',
    name: 'Patient A',
    treatment: 'Dental Implants',
  },
  {
    id: 't2',
    quote:
      'I had put off visiting a dentist for years. The calm environment and gentle approach made the whole experience far easier than I expected.',
    name: 'Patient B',
    treatment: 'General Dentistry',
  },
  {
    id: 't3',
    quote:
      'My daughter was nervous at first, but the team were patient and kind. She now looks forward to her check-ups.',
    name: 'Patient C',
    treatment: 'Pediatric Dentistry',
  },
]
