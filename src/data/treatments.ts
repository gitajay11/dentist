export interface Treatment {
  id: string
  title: string
  /** Two-line version for the compact gallery tiles ("\n" = line break). */
  short: string
  description: string
}

export const treatments: Treatment[] = [
  {
    id: 'general-dentistry',
    title: 'General Dentistry',
    short: 'General\nDentistry',
    description: 'Routine dental care, examinations, cleaning, and preventive treatments.',
  },
  {
    id: 'dental-implants',
    title: 'Dental Implants',
    short: 'Dental\nImplants',
    description: 'Modern implant solutions designed to restore function and confidence.',
  },
  {
    id: 'cosmetic-dentistry',
    title: 'Cosmetic Dentistry',
    short: 'Cosmetic\nDentistry',
    description: 'Aesthetic treatments designed to improve the appearance of your smile.',
  },
  {
    id: 'orthodontics',
    title: 'Orthodontics',
    short: 'Orthodontics',
    description: 'Personalized solutions for straighter, healthier smiles.',
  },
  {
    id: 'root-canal-treatment',
    title: 'Root Canal Treatment',
    short: 'Root Canal\nTreatment',
    description: 'Carefully planned treatment to preserve natural teeth when possible.',
  },
  {
    id: 'pediatric-dentistry',
    title: 'Pediatric Dentistry',
    short: 'Pediatric\nDentistry',
    description: 'Gentle, age-appropriate dental care for children.',
  },
  {
    id: 'teeth-whitening',
    title: 'Teeth Whitening',
    short: 'Teeth\nWhitening',
    description: 'Professional whitening options for a brighter smile.',
  },
  {
    id: 'gum-care',
    title: 'Gum Care',
    short: 'Gum\nCare',
    description: 'Prevention, diagnosis, and treatment of gum-related conditions.',
  },
]

/** The four tiles shown in the Smile Gallery strip (ids from the list above). */
export const galleryHighlights = ['cosmetic-dentistry', 'teeth-whitening', 'dental-implants', 'orthodontics']
