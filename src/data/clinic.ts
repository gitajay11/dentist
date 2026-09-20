/**
 * Clinic identity & contact details.
 *
 * "Dental Health / Quality Healthcare" is the reference template's brand and
 * stands in until the real clinic name is supplied. Everything in square
 * brackets is a PLACEHOLDER — replace with verified information before
 * launch (also update the JSON-LD block in index.html).
 */
export const clinic = {
  name: 'Dental Health',
  /** Wordmark is stacked on two lines in the navbar / footer. */
  wordmark: ['Dental', 'Health'],
  tagline: 'quality healthcare',
  city: 'Chennai',

  phone: '[+91 00000 00000]',
  phoneHref: 'tel:+910000000000',
  email: '[hello@clinic.example]',
  emailHref: 'mailto:hello@clinic.example',

  address: {
    line1: '[Street address, Building name]',
    line2: '[Area], Chennai, Tamil Nadu [PIN]',
  },

  hours: [
    { days: 'Monday – Saturday', time: '[9:00 AM – 8:00 PM]' },
    { days: 'Sunday', time: '[Closed]' },
  ],

  /** Google Maps directions link — replace the query with the real address. */
  directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Chennai',

  /** Set to true only if the clinic genuinely offers these. Copy adapts. */
  offersEmergencyCare: false,
  offersSameDayConsultations: false,

  social: [] as { label: string; href: string }[],
}

/**
 * Photography — reference template assets (AI-generated, hot-linked).
 * Replace with the clinic's own photography before launch. The hero and
 * gallery images must have a plain light background with the subject on the
 * right: the masked-card mosaic depends on it.
 */
export const images = {
  hero: {
    src: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_113640_ccf3cf97-d447-425b-a134-d7b09fc743fc.png&w=1920&q=85',
    alt: 'Smiling patient holding a pair of glasses against a white background',
  },
  gallery: {
    src: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_114219_414dfe80-f15c-4e25-bf52-b13721f4bd88.png&w=1920&q=85',
    alt: 'Patient with a confident smile against a white background',
  },
  implantProcedure: {
    src: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_115253_c19ab167-8dd5-48b4-967d-b9f0d9d6e8fb.png&w=1280&q=85',
    alt: 'Dental implant procedure',
  },
  implantRestoration: {
    src: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_115237_fc519057-6e87-4abf-999a-9610b8b085b4.png&w=1280&q=85',
    alt: 'Dental restoration',
  },
  implantPatient: {
    src: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_114355_752ba9e6-0942-4abb-9047-5d9bb16632e9.png&w=1280&q=85',
    alt: 'Smiling patient',
  },
} as const

/**
 * Header / menu / footer links — keep this in the same order as the
 * sections are rendered in App.tsx so the nav reads top-to-bottom.
 */
export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
] as const

/**
 * Trust statistics — PLACEHOLDER VALUES.
 * Replace with verified figures or remove the block entirely.
 */
export const stats = [
  { value: '10+', label: 'Years of experience' },
  { value: '25K+', label: 'Patients served' },
  { value: '15+', label: 'Treatment specialties' },
  { value: '4.9/5', label: 'Patient rating' },
]
