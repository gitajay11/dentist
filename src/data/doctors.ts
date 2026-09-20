/**
 * Dentist profiles — ALL PLACEHOLDERS.
 * Do not publish until real names, qualifications, registration details,
 * specialties, experience and photographs are supplied by the clinic.
 */
export interface Doctor {
  id: string
  name: string
  credentials: string
  specialty: string
  experience: string
  bio: string
  image: { src: string; alt: string }
  /** Optional contact links shown on hover/focus. */
  links?: { label: 'Email' | 'Phone' | 'Profile'; href: string }[]
}

export const doctors: Doctor[] = [
  {
    id: 'doctor-1',
    name: 'Dr. [Full Name]',
    credentials: '[BDS, MDS]',
    specialty: '[Specialty]',
    experience: '[X]+ years',
    bio: '[Short professional description: clinical focus, approach to patient care, memberships.]',
    image: {
      src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
      alt: 'Placeholder portrait of a dentist',
    },
  },
  {
    id: 'doctor-2',
    name: 'Dr. [Full Name]',
    credentials: '[BDS, MDS]',
    specialty: '[Specialty]',
    experience: '[X]+ years',
    bio: '[Short professional description: clinical focus, approach to patient care, memberships.]',
    image: {
      src: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
      alt: 'Placeholder portrait of a dentist',
    },
  },
  {
    id: 'doctor-3',
    name: 'Dr. [Full Name]',
    credentials: '[BDS]',
    specialty: '[Specialty]',
    experience: '[X]+ years',
    bio: '[Short professional description: clinical focus, approach to patient care, memberships.]',
    image: {
      src: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80',
      alt: 'Placeholder portrait of a dentist',
    },
  },
]
