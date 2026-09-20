import type { AppointmentFormErrors, AppointmentFormValues } from './validation'

/**
 * Appointment submission.
 *
 * Endpoint: POST /api/appointments — implemented in server/appointments.ts.
 * The server re-validates every field, rate-limits, checks the honeypot
 * (`website` must be empty) and emails the clinic + patient.
 *
 * Responses:
 *   200 { ok: true, reference }
 *   400 { ok: false, message, errors: { field: message } }
 *   429 { ok: false, message }        rate limited
 *   502 { ok: false, message }        email delivery failed
 *
 * No secrets belong in this file or anywhere in the client bundle.
 */
export const APPOINTMENTS_ENDPOINT = '/api/appointments'

export interface AppointmentResponse {
  ok: boolean
  reference?: string
  message?: string
  errors?: AppointmentFormErrors
}

export class ApiError extends Error {
  status: number
  /** Human-readable message from the server, when it sent one. */
  serverMessage?: string
  fieldErrors?: AppointmentFormErrors

  constructor(message: string, status: number, serverMessage?: string, fieldErrors?: AppointmentFormErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.serverMessage = serverMessage
    this.fieldErrors = fieldErrors
  }
}

export async function submitAppointment(
  values: AppointmentFormValues,
  signal?: AbortSignal,
): Promise<AppointmentResponse> {
  const res = await fetch(APPOINTMENTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...values, submittedAt: new Date().toISOString() }),
    signal,
  })

  // Guard against SPA fallbacks that answer any route with index.html.
  const isJson = res.headers.get('content-type')?.includes('application/json') ?? false
  const data = isJson ? ((await res.json()) as AppointmentResponse) : null

  if (!res.ok || !data) {
    throw new ApiError(
      `Appointment request failed (${res.status})`,
      res.status,
      data?.message,
      data?.errors,
    )
  }

  if (!data.ok) {
    throw new ApiError(data.message ?? 'Appointment request was not accepted.', res.status, data.message, data.errors)
  }
  return data
}
