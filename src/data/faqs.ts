/**
 * FAQ content — written generically. Bracketed values are placeholders;
 * have the clinic review every answer for accuracy before launch.
 */
export interface FAQ {
  id: string
  question: string
  answer: string
}

export const faqs: FAQ[] = [
  {
    id: 'treatments',
    question: 'What treatments do you offer?',
    answer:
      'We provide general and preventive dentistry, dental implants, cosmetic dentistry, orthodontics, root canal treatment, paediatric dentistry, teeth whitening and gum care. If you are unsure which treatment is right for you, a consultation is the best place to start.',
  },
  {
    id: 'booking',
    question: 'How do I book an appointment?',
    answer:
      'You can request an appointment through the form on this page, or call us directly during opening hours. Our team will confirm a suitable time with you.',
  },
  {
    id: 'emergency',
    question: 'Do you accept emergency dental visits?',
    answer:
      '[Clinic to confirm.] If you are experiencing severe pain, swelling or a dental injury, please call us so we can advise on the earliest available appointment.',
  },
  {
    id: 'consultation-length',
    question: 'How long does a consultation take?',
    answer:
      'A first consultation typically takes around [30–45 minutes]. This allows time for a thorough examination, any necessary imaging, and a clear discussion of your options.',
  },
  {
    id: 'children',
    question: "Do you provide children’s dental care?",
    answer:
      'Yes. We offer gentle, age-appropriate care for children, with a focus on prevention and making each visit a positive experience.',
  },
  {
    id: 'what-to-bring',
    question: 'What should I bring to my appointment?',
    answer:
      'Please bring any previous dental records or X-rays, a list of current medications, and details of any medical conditions or allergies. This helps us plan your care safely.',
  },
  {
    id: 'follow-up',
    question: 'Do you offer follow-up consultations?',
    answer:
      'Yes. Follow-up visits are an important part of most treatment plans, and we will recommend a review schedule that suits your individual needs.',
  },
]
