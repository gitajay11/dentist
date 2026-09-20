/**
 * Client-side validation for the appointment form.
 * This is a UX convenience only — the backend must validate again.
 */

export interface AppointmentFormValues {
  fullName: string
  phone: string
  email: string
  preferredDate: string
  preferredTime: string
  treatment: string
  message: string
  /** Honeypot — must stay empty. Bots tend to fill every field. */
  website: string
}

export type AppointmentFormErrors = Partial<Record<keyof AppointmentFormValues, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Accepts +, spaces, dashes and parentheses; requires 8–15 digits. */
const PHONE_ALLOWED_RE = /^[+\d\s()-]+$/

export function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function validateField(
  name: keyof AppointmentFormValues,
  value: string,
): string | undefined {
  const v = value.trim()

  switch (name) {
    case 'fullName':
      if (!v) return 'Please enter your full name.'
      if (v.length < 2) return 'Name looks too short.'
      return undefined

    case 'phone': {
      if (!v) return 'Please enter a phone number.'
      if (!PHONE_ALLOWED_RE.test(v)) return 'Use digits, spaces, +, - or ( ) only.'
      const digits = v.replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 15) return 'Enter a valid phone number.'
      return undefined
    }

    case 'email':
      if (!v) return 'Please enter your email address.'
      if (!EMAIL_RE.test(v)) return 'Enter a valid email address.'
      return undefined

    case 'preferredDate': {
      if (!v) return 'Please choose a preferred date.'
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Enter a valid date.'
      if (v < todayISO()) return 'Please choose today or a future date.'
      return undefined
    }

    case 'preferredTime':
      if (!v) return 'Please choose a preferred time.'
      return undefined

    case 'treatment':
      if (!v) return 'Please tell us the reason for your visit.'
      return undefined

    case 'message':
      if (v.length > 1000) return 'Please keep your message under 1000 characters.'
      return undefined

    case 'website':
      return undefined
  }
}

export function validateAll(values: AppointmentFormValues): AppointmentFormErrors {
  const errors: AppointmentFormErrors = {}
  ;(Object.keys(values) as (keyof AppointmentFormValues)[]).forEach((key) => {
    const err = validateField(key, values[key])
    if (err) errors[key] = err
  })
  return errors
}
