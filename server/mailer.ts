import nodemailer, { type Transporter } from 'nodemailer'
import type { AppointmentFormValues } from '../src/lib/validation.ts'
import { env, smtpConfigured } from './env.ts'

export type AppointmentRequest = Omit<AppointmentFormValues, 'website'> & {
  reference: string
  receivedAt: Date
  ip: string
}

let transporter: Transporter | null = null

/**
 * SMTP transport when configured; otherwise a "json" transport that prints
 * the message to the console so the whole flow can be exercised locally.
 */
export function getTransporter(): Transporter {
  if (transporter) return transporter

  if (smtpConfigured) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure, // true for 465, false for 587/STARTTLS
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true })
  }
  return transporter
}

/** Verifies SMTP credentials at startup so misconfiguration is visible immediately. */
export async function verifyTransport(): Promise<void> {
  if (!smtpConfigured) {
    console.warn(
      '[mail] SMTP not configured — emails will be printed to the console instead of sent. ' +
        'Set SMTP_HOST, MAIL_FROM and MAIL_TO (see .env.example).',
    )
    return
  }
  await getTransporter().verify()
  console.log(`[mail] SMTP connection verified (${env.smtp.host}:${env.smtp.port})`)
}

/* ------------------------------------------------------------------ */

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c)

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function rows(a: AppointmentRequest): [string, string][] {
  return [
    ['Reference', a.reference],
    ['Name', a.fullName],
    ['Phone', a.phone],
    ['Email', a.email],
    ['Preferred date', formatDate(a.preferredDate)],
    ['Preferred time', a.preferredTime],
    ['Treatment / reason', a.treatment],
    ['Message', a.message || '—'],
    ['Received', a.receivedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'],
  ]
}

function table(a: AppointmentRequest): string {
  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px">
${rows(a)
  .map(
    ([k, v]) =>
      `<tr><td style="padding:8px 16px 8px 0;color:#647777;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:8px 0;color:#102a2a;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
  )
  .join('\n')}
</table>`
}

const wrap = (title: string, body: string) => `<!doctype html>
<html><body style="margin:0;background:#f7faf9;font-family:Helvetica,Arial,sans-serif;color:#102a2a">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
  <div style="background:#ffffff;border:1px solid #dce8e6;border-radius:16px;padding:28px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#0e6f6a">${escapeHtml(env.mail.clinicName)}</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:600">${title}</h1>
    ${body}
  </div>
</div>
</body></html>`

/* ------------------------------------------------------------------ */

/** Notification to the clinic inbox. Reply-To is the patient. */
export async function sendClinicNotification(a: AppointmentRequest) {
  const text = rows(a)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  return getTransporter().sendMail({
    from: env.mail.from || `${env.mail.clinicName} <no-reply@localhost>`,
    to: env.mail.to.length ? env.mail.to : 'reception@localhost',
    replyTo: `${a.fullName} <${a.email}>`,
    subject: `New appointment request — ${a.fullName} (${a.treatment}) · ${a.reference}`,
    text: `New appointment request via the website.\n\n${text}\n\nReply to this email to contact the patient.`,
    html: wrap(
      'New appointment request',
      `${table(a)}<p style="margin:20px 0 0;font-size:13px;color:#647777">Reply to this email to contact the patient directly.</p>`,
    ),
  })
}

/** Acknowledgement to the patient. Deliberately does NOT confirm the appointment. */
export async function sendPatientConfirmation(a: AppointmentRequest) {
  const first = a.fullName.split(/\s+/)[0]
  const intro = `Hello ${first},\n\nThank you for your appointment request. Our team will contact you on ${a.phone} to confirm a time. Your appointment is not confirmed until you hear from us.\n\n`
  const text = rows(a)
    .filter(([k]) => !['Received'].includes(k))
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  return getTransporter().sendMail({
    from: env.mail.from || `${env.mail.clinicName} <no-reply@localhost>`,
    to: `${a.fullName} <${a.email}>`,
    // Patient replies go straight to the clinic inbox.
    replyTo: env.mail.to[0],
    subject: `We received your appointment request · ${a.reference}`,
    text: `${intro}${text}\n\nIf anything changes, call us on ${env.mail.clinicPhone}.\n\n${env.mail.clinicName}`,
    html: wrap(
      'We received your request',
      `<p style="margin:0 0 16px;line-height:1.6">Hello ${escapeHtml(first)},<br>Thank you for your appointment request. Our team will contact you on <strong>${escapeHtml(a.phone)}</strong> to confirm a time. <strong>Your appointment is not confirmed until you hear from us.</strong></p>
${table({ ...a, message: a.message || '' })}
<p style="margin:20px 0 0;font-size:13px;color:#647777">If anything changes, call us on ${escapeHtml(env.mail.clinicPhone)}.</p>`,
    ),
  })
}
