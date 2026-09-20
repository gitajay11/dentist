import { useEffect, useId, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import ArrowIcon from './ArrowIcon'
import DatePicker from './ui/DatePicker'
import SegmentedControl from './ui/SegmentedControl'
import Select from './ui/Select'
import { clinic } from '../data/clinic'
import { treatments } from '../data/treatments'
import { useBooking } from '../context/BookingContext'
import { ApiError, submitAppointment } from '../lib/api'
import {
  todayISO,
  validateAll,
  validateField,
  type AppointmentFormErrors,
  type AppointmentFormValues,
} from '../lib/validation'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const initialValues: AppointmentFormValues = {
  fullName: '',
  phone: '',
  email: '',
  preferredDate: '',
  preferredTime: '',
  treatment: '',
  message: '',
  website: '',
}

// Slot hints are generic — align them with the clinic's real opening hours.
const formatDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const timeSlots = [
  { value: 'Morning', label: 'Morning', hint: 'until 12 pm' },
  { value: 'Afternoon', label: 'Afternoon', hint: '12 – 4 pm' },
  { value: 'Evening', label: 'Evening', hint: 'after 4 pm' },
]

const treatmentOptions = [
  ...treatments.map((t) => ({ value: t.title, label: t.title, group: 'Treatments' })),
  { value: 'General consultation', label: 'General consultation', group: 'Not sure?' },
  { value: 'Not sure yet', label: 'Not sure yet', group: 'Not sure?' },
]

/* ------------------------------------------------------------------ */

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: (a: { id: string; labelId: string; describedBy?: string; invalid: boolean }) => ReactNode
}

function Field({ id, label, error, hint, required = true, className = '', children }: FieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const labelId = `${id}-label`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label id={labelId} htmlFor={id} className="field-label">
        {label}
        {required ? (
          <span aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="ml-1 text-xs font-normal text-neutral-500">(optional)</span>
        )}
      </label>
      {children({ id, labelId, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          <span aria-hidden="true" className="mt-px">!</span>
          {error}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function AppointmentForm() {
  const uid = useId()
  const { treatment: preselected, requestId } = useBooking()

  const [values, setValues] = useState<AppointmentFormValues>(initialValues)
  const [errors, setErrors] = useState<AppointmentFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof AppointmentFormValues, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverMessage, setServerMessage] = useState<string>('')
  const [reference, setReference] = useState<string | undefined>()
  const [appliedRequestId, setAppliedRequestId] = useState(0)

  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Bring the confirmation into view and announce it once it appears.
  useEffect(() => {
    if (status !== 'success') return
    const el = successRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    el.focus({ preventScroll: true })
  }, [status])

  // A treatment card was clicked → pre-fill the select. Adjusting state
  // during render (rather than in an effect) avoids an extra render pass.
  if (requestId !== appliedRequestId) {
    setAppliedRequestId(requestId)
    if (preselected) {
      setValues((v) => ({ ...v, treatment: preselected }))
      setErrors((e) => ({ ...e, treatment: undefined }))
      if (status === 'success') setStatus('idle')
    }
  }

  useEffect(() => () => abortRef.current?.abort(), [])

  const fieldId = (name: keyof AppointmentFormValues) => `${uid}-${name}`

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof AppointmentFormValues
    const value = e.target.value
    setValues((v) => ({ ...v, [name]: value }))
    if (touched[name]) setErrors((errs) => ({ ...errs, [name]: validateField(name, value) }))
  }

  const onBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof AppointmentFormValues
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors((errs) => ({ ...errs, [name]: validateField(name, e.target.value) }))
  }

  // Custom controls (date picker, select, segmented) report values directly.
  const setField = (name: keyof AppointmentFormValues, value: string) => {
    setValues((v) => ({ ...v, [name]: value }))
    setErrors((errs) => ({ ...errs, [name]: validateField(name, value) }))
    setTouched((t) => ({ ...t, [name]: true }))
  }
  const blurField = (name: keyof AppointmentFormValues) => {
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors((errs) => ({ ...errs, [name]: validateField(name, values[name]) }))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'submitting') return

    const nextErrors = validateAll(values)
    setErrors(nextErrors)
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      preferredDate: true,
      preferredTime: true,
      treatment: true,
      message: true,
    })

    const firstError = (Object.keys(nextErrors) as (keyof AppointmentFormValues)[]).find((k) => nextErrors[k])
    if (firstError) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${firstError}"]`)?.focus()
      return
    }

    // Honeypot filled → silently pretend nothing happened.
    if (values.website) {
      setStatus('success')
      return
    }

    setStatus('submitting')
    setServerMessage('')
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await submitAppointment(values, controller.signal)
      setReference(res.reference)
      setStatus('success')
    } catch (err) {
      if (controller.signal.aborted) return

      // Server-side validation disagreed — show its field errors inline.
      if (err instanceof ApiError && err.status === 400 && err.fieldErrors) {
        setStatus('idle')
        setErrors(err.fieldErrors)
        const first = (Object.keys(err.fieldErrors) as (keyof AppointmentFormValues)[])[0]
        if (first) formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus()
        return
      }

      setStatus('error')
      setServerMessage(
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : err instanceof ApiError && err.status === 404
            ? 'Online booking is not connected yet.'
            : 'We could not send your request right now.',
      )
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setStatus('idle')
    setServerMessage('')
    setReference(undefined)
  }

  const inputProps = (name: keyof AppointmentFormValues, a: { id: string; describedBy?: string; invalid: boolean }) => ({
    id: a.id,
    name,
    'data-field': name,
    value: values[name],
    onChange,
    onBlur,
    'aria-describedby': a.describedBy,
    'aria-invalid': a.invalid || undefined,
    disabled: status === 'submitting',
    className: 'field-input',
  })

  /* ---------------------------------------------------------------- */

  if (status === 'success') {
    const summary = [
      { label: 'Date', value: formatDate(values.preferredDate) },
      { label: 'Time', value: values.preferredTime },
      { label: 'Treatment', value: values.treatment },
    ]
    return (
      <div
        ref={successRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className="card-r flex min-h-[24rem] flex-1 flex-col justify-between gap-8 bg-black p-6 text-white outline-none md:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white md:h-14 md:w-14" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path d="M2 7.5l3.2 3L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {reference && (
            <span className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase">
              Ref · {reference}
            </span>
          )}
        </div>

        <dl className="grid gap-2 lg:grid-cols-3 lg:gap-3">
          {summary.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline justify-between gap-4 rounded-xl border border-white/15 px-4 py-3 lg:flex-col lg:gap-1.5 lg:p-4"
            >
              <dt className="label text-white/50">{s.label}</dt>
              <dd className="text-right text-sm font-semibold lg:text-left">{s.value || '—'}</dd>
            </div>
          ))}
        </dl>

        <div>
          <h3 className="text-[clamp(2rem,4vw,3.25rem)] leading-[0.95] font-bold">Request received</h3>
          <p className="mt-4 max-w-md text-sm text-white/75 md:text-base">
            Thank you, {values.fullName.split(' ')[0]}. Our team will contact you on {values.phone} to confirm your
            appointment — it is not confirmed until you hear from us.
          </p>
          <button type="button" onClick={reset} className="pill pill-white pill-md mt-6">
            Send another request
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-busy={status === 'submitting'}
      aria-describedby={`${uid}-form-note`}
      className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5"
    >
      <div className="sm:col-span-2">
        <h3 className="text-2xl leading-tight font-bold text-black md:text-3xl">Request an appointment</h3>
        <p className="mt-1.5 mb-2 text-xs font-semibold text-neutral-500 md:mb-3 md:text-sm">Fields marked * are required.</p>
      </div>

      <Field id={fieldId('fullName')} label="Full Name" error={touched.fullName ? errors.fullName : undefined}>
        {(a) => <input type="text" autoComplete="name" placeholder="Your name" {...inputProps('fullName', a)} />}
      </Field>

      <Field id={fieldId('phone')} label="Phone" error={touched.phone ? errors.phone : undefined}>
        {(a) => (
          <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 …" {...inputProps('phone', a)} />
        )}
      </Field>

      <Field
        id={fieldId('email')}
        label="Email"
        error={touched.email ? errors.email : undefined}
        className="sm:col-span-2"
      >
        {(a) => (
          <input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" {...inputProps('email', a)} />
        )}
      </Field>

      <Field
        id={fieldId('preferredDate')}
        label="Preferred Date"
        error={touched.preferredDate ? errors.preferredDate : undefined}
      >
        {(a) => (
          <DatePicker
            id={a.id}
            name="preferredDate"
            value={values.preferredDate}
            min={todayISO()}
            onChange={(v) => setField('preferredDate', v)}
            onBlur={() => blurField('preferredDate')}
            invalid={a.invalid}
            describedBy={a.describedBy}
            disabled={status === 'submitting'}
          />
        )}
      </Field>

      <Field
        id={fieldId('preferredTime')}
        label="Preferred Time"
        error={touched.preferredTime ? errors.preferredTime : undefined}
      >
        {(a) => (
          <SegmentedControl
            id={a.id}
            name="preferredTime"
            value={values.preferredTime}
            options={timeSlots}
            onChange={(v) => setField('preferredTime', v)}
            onBlur={() => blurField('preferredTime')}
            labelledBy={a.labelId}
            invalid={a.invalid}
            describedBy={a.describedBy}
            disabled={status === 'submitting'}
          />
        )}
      </Field>

      <Field
        id={fieldId('treatment')}
        label="Treatment / Reason for Visit"
        error={touched.treatment ? errors.treatment : undefined}
        className="sm:col-span-2"
      >
        {(a) => (
          <Select
            id={a.id}
            name="treatment"
            value={values.treatment}
            options={treatmentOptions}
            placeholder="Select a treatment"
            onChange={(v) => setField('treatment', v)}
            onBlur={() => blurField('treatment')}
            invalid={a.invalid}
            describedBy={a.describedBy}
            disabled={status === 'submitting'}
          />
        )}
      </Field>

      <Field
        id={fieldId('message')}
        label="Message"
        required={false}
        error={touched.message ? errors.message : undefined}
        hint="Anything you would like us to know before your visit."
        className="sm:col-span-2"
      >
        {(a) => (
          <textarea rows={4} maxLength={1000} placeholder="Tell us a little about your concern" {...inputProps('message', a)} className="field-input resize-y" />
        )}
      </Field>

      {/* Honeypot — hidden from real users and assistive tech. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={fieldId('website')}>Website</label>
        <input
          id={fieldId('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={onChange}
        />
      </div>

      <div className="sm:col-span-2">
        {status === 'error' && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <span aria-hidden="true" className="font-bold">!</span>
              <span>
                <strong className="font-semibold">{serverMessage}</strong> Please call us on{' '}
                <a href={clinic.phoneHref} className="underline underline-offset-2">
                  {clinic.phone}
                </a>{' '}
                and we will book you in.
              </span>
            </div>
          )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="pill pill-black group w-full px-6 py-4 text-sm md:py-5 md:text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? (
            <>
              <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending request…
            </>
          ) : (
            <>
              Request Appointment
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/60 transition-colors duration-300 group-hover:bg-white group-hover:text-black">
                <ArrowIcon size={11} />
              </span>
            </>
          )}
        </button>

        <p id={`${uid}-form-note`} className="mt-4 text-center text-[11px] leading-relaxed text-black/60 md:text-xs">
          Submitting this form sends a request only. Your appointment is confirmed once our team contacts you.
        </p>
      </div>
    </form>
  )
}
