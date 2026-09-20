import { existsSync } from 'node:fs'
import path from 'node:path'
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer'
import { clinic } from '../src/data/clinic.ts'
import type { AppointmentFormValues } from '../src/lib/validation.ts'
import { env, smtpConfigured } from './env.ts'

export type AppointmentRequest = Omit<AppointmentFormValues, 'website'> & {
  reference: string
  receivedAt: Date
  ip: string
}

/* ------------------------------------------------------------------
   Transport
------------------------------------------------------------------- */

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

/* ------------------------------------------------------------------
   Brand + helpers
------------------------------------------------------------------- */

const brand = {
  name: clinic.name,
  tagline: clinic.tagline,
  phone: clinic.phone,
  phoneHref: clinic.phoneHref,
  email: env.mail.to[0] ?? clinic.email,
  address: `${clinic.address.line1}, ${clinic.address.line2}`,
  hours: clinic.hours.map((h) => `${h.days}: ${h.time}`),
  directionsUrl: clinic.directionsUrl,
  city: clinic.city,
}

/** Logo is attached inline (CID) so it renders without a public host. */
const LOGO_CID = 'caredental-logo'
const logoPath = path.resolve(process.cwd(), 'public/logo-192.png')
const logoAttachment: SendMailOptions['attachments'] = existsSync(logoPath)
  ? [{ filename: 'logo.png', path: logoPath, cid: LOGO_CID, contentDisposition: 'inline' }]
  : []

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c)
const nl2br = (s: string) => esc(s).replace(/\n/g, '<br>')

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const SLOT_HOURS: Record<string, { start: string; end: string; label: string }> = {
  Morning: { start: '090000', end: '120000', label: 'Morning · 9 am – 12 pm' },
  Afternoon: { start: '120000', end: '160000', label: 'Afternoon · 12 – 4 pm' },
  Evening: { start: '160000', end: '200000', label: 'Evening · 4 – 8 pm' },
}
const slotLabel = (slot: string) => SLOT_HOURS[slot]?.label ?? slot

/** Digits only; Indian 10-digit numbers get the country code for wa.me / tel. */
const digits = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 ? `91${d}` : d
}

const firstName = (name: string) => name.trim().split(/\s+/)[0]

/** Google Calendar "add event" link for the requested slot (marked tentative). */
function calendarUrl(a: AppointmentRequest, forClinic: boolean) {
  const slot = SLOT_HOURS[a.preferredTime] ?? SLOT_HOURS.Morning
  const day = a.preferredDate.replace(/-/g, '')
  const title = forClinic
    ? `${a.fullName} — ${a.treatment} (${brand.name})`
    : `${brand.name} — ${a.treatment} (to be confirmed)`
  const details = forClinic
    ? `Booking request ${a.reference}\nPhone: ${a.phone}\nEmail: ${a.email}\n${a.message ? `Message: ${a.message}` : ''}`
    : `Reference ${a.reference}. The clinic will call ${a.phone} to confirm the exact time.`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${day}T${slot.start}/${day}T${slot.end}`,
    details,
    location: brand.address,
    ctz: 'Asia/Kolkata',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/* ------------------------------------------------------------------
   HTML building blocks (tables + inline styles = safe in every client)
------------------------------------------------------------------- */

const FONT = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"

function button(label: string, href: string, variant: 'black' | 'outline' = 'black') {
  const styles =
    variant === 'black'
      ? 'background:#000000;color:#ffffff;border:1px solid #000000;'
      : 'background:#ffffff;color:#000000;border:1px solid #000000;'
  return `<td style="padding:0 8px 8px 0"><a href="${esc(href)}" style="${FONT}display:inline-block;${styles}border-radius:999px;padding:12px 20px;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap">${esc(label)}</a></td>`
}

function buttons(items: [label: string, href: string, variant?: 'black' | 'outline'][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${items
    .map(([l, h, v]) => button(l, h, v))
    .join('')}</tr></table>`
}

function tile(icon: string, label: string, value: string, wide = false) {
  return `<td width="${wide ? '100%' : '50%'}" valign="top" style="padding:0 8px 8px 0" ${wide ? 'colspan="2"' : ''}>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;border-radius:14px">
    <tr><td style="padding:14px 16px">
      <div style="${FONT}font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#71717a">${icon}&nbsp; ${esc(label)}</div>
      <div style="${FONT}font-size:15px;font-weight:700;color:#000000;margin-top:6px;line-height:1.35">${value}</div>
    </td></tr>
  </table>
</td>`
}

/** Lay tiles out two per row. */
function tiles(cells: string[]) {
  const rows: string[] = []
  for (let i = 0; i < cells.length; i += 2) rows.push(`<tr>${cells.slice(i, i + 2).join('')}</tr>`)
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table>`
}

function steps(items: [title: string, text: string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items
    .map(
      ([t, x], i) => `<tr>
    <td width="40" valign="top" style="padding:0 12px 14px 0"><div style="${FONT}width:28px;height:28px;line-height:28px;border-radius:999px;background:#000;color:#fff;font-size:12px;font-weight:700;text-align:center">${i + 1}</div></td>
    <td valign="top" style="padding:0 0 14px 0"><div style="${FONT}font-size:15px;font-weight:700;color:#000">${esc(t)}</div><div style="${FONT}font-size:13px;color:#52525b;line-height:1.5;margin-top:2px">${esc(x)}</div></td>
  </tr>`,
    )
    .join('')}</table>`
}

interface LayoutOptions {
  preheader: string
  eyebrow: string
  title: string
  intro: string
  reference: string
  body: string
  note?: string
}

function layout(o: LayoutOptions) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${esc(o.title)}</title>
</head>
<body style="margin:0;padding:0;background:#ebebed;${FONT}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ebebed">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

        <!-- Header -->
        <tr><td style="background:#000000;border-radius:20px 20px 0 0;padding:22px 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="56" valign="middle"><img src="cid:${LOGO_CID}" width="52" height="52" alt="" style="display:block;border-radius:999px;background:#ffffff"></td>
            <td valign="middle" style="padding-left:14px">
              <div style="${FONT}color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.3px;text-transform:uppercase">${esc(brand.name)}</div>
              <div style="${FONT}color:#a1a1aa;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-top:4px">${esc(brand.tagline)}</div>
            </td>
            <td align="right" valign="middle"><span style="${FONT}display:inline-block;border:1px solid #3f3f46;color:#d4d4d8;border-radius:999px;padding:6px 12px;font-size:11px;font-weight:700;letter-spacing:1px">${esc(o.reference)}</span></td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px 28px 8px 28px">
          <div style="${FONT}font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#71717a">${esc(o.eyebrow)}</div>
          <h1 style="${FONT}margin:10px 0 12px 0;font-size:28px;line-height:1.1;font-weight:800;letter-spacing:-0.5px;color:#000">${esc(o.title)}</h1>
          <p style="${FONT}margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#3f3f46">${o.intro}</p>
          ${o.body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:8px 28px 28px 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e4e4e7"><tr><td style="padding-top:20px">
            ${o.note ? `<p style="${FONT}margin:0 0 14px 0;font-size:13px;line-height:1.6;color:#52525b">${o.note}</p>` : ''}
            <div style="${FONT}font-size:13px;line-height:1.7;color:#71717a">
              <strong style="color:#000">${esc(brand.name)}</strong> · ${esc(brand.address)}<br>
              ${brand.hours.map(esc).join(' &nbsp;·&nbsp; ')}<br>
              <a href="${esc(brand.phoneHref)}" style="color:#000;font-weight:700;text-decoration:none">${esc(brand.phone)}</a>
              &nbsp;·&nbsp; <a href="mailto:${esc(brand.email)}" style="color:#000;font-weight:700;text-decoration:none">${esc(brand.email)}</a>
            </div>
          </td></tr></table>
        </td></tr>

        <tr><td align="center" style="padding:16px 0 0 0"><p style="${FONT}margin:0;font-size:11px;color:#a1a1aa">Sent by the ${esc(brand.name)} website because an appointment was requested online.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/* ------------------------------------------------------------------
   Emails
------------------------------------------------------------------- */

/** Notification to the clinic inbox. Reply-To is the patient. */
export async function sendClinicNotification(a: AppointmentRequest) {
  const first = firstName(a.fullName)
  const received = a.receivedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

  const body = `
    ${tiles([
      tile('📅', 'Preferred date', esc(formatDate(a.preferredDate))),
      tile('🕒', 'Preferred time', esc(slotLabel(a.preferredTime))),
      tile('🦷', 'Treatment / reason', esc(a.treatment)),
      tile('👤', 'Patient', esc(a.fullName)),
      tile('📞', 'Phone', `<a href="tel:+${digits(a.phone)}" style="color:#000;text-decoration:none">${esc(a.phone)}</a>`),
      tile('✉️', 'Email', `<a href="mailto:${esc(a.email)}" style="color:#000;text-decoration:none">${esc(a.email)}</a>`),
      tile('💬', 'Message', a.message ? nl2br(a.message) : '<span style="color:#a1a1aa;font-weight:500">No message</span>', true),
    ])}
    <div style="${FONT}font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#71717a;margin:18px 0 10px 0">Act on this request</div>
    ${buttons([
      [`Call ${first}`, `tel:+${digits(a.phone)}`],
      ['WhatsApp', `https://wa.me/${digits(a.phone)}?text=${encodeURIComponent(`Hello ${first}, this is ${brand.name} about your appointment request ${a.reference}.`)}`, 'outline'],
      ['Email patient', `mailto:${a.email}?subject=${encodeURIComponent(`Your appointment request ${a.reference}`)}`, 'outline'],
      ['Add to calendar', calendarUrl(a, true), 'outline'],
    ])}
    <p style="${FONT}margin:14px 0 16px 0;font-size:12px;color:#71717a">Received ${esc(received)} IST · from the website booking form. Reply to this email and it goes straight to the patient.</p>`

  const text = [
    `New booking request ${a.reference}`,
    '',
    `Patient: ${a.fullName}`,
    `Phone: ${a.phone}`,
    `Email: ${a.email}`,
    `Preferred date: ${formatDate(a.preferredDate)}`,
    `Preferred time: ${slotLabel(a.preferredTime)}`,
    `Treatment / reason: ${a.treatment}`,
    `Message: ${a.message || '—'}`,
    `Received: ${received} IST`,
    '',
    `Call: tel:+${digits(a.phone)}`,
    `WhatsApp: https://wa.me/${digits(a.phone)}`,
    `Add to calendar: ${calendarUrl(a, true)}`,
    '',
    'Reply to this email to answer the patient directly.',
  ].join('\n')

  return getTransporter().sendMail({
    from: env.mail.from || `${brand.name} <no-reply@localhost>`,
    to: env.mail.to.length ? env.mail.to : 'reception@localhost',
    replyTo: `${a.fullName} <${a.email}>`,
    subject: `New booking request — ${a.fullName} · ${a.treatment} · ${formatDate(a.preferredDate)}`,
    text,
    html: layout({
      preheader: `${a.fullName} asked for ${a.treatment} on ${formatDate(a.preferredDate)} (${a.preferredTime}). Phone ${a.phone}.`,
      eyebrow: 'New booking request',
      title: `${a.fullName} wants an appointment`,
      intro: `A patient requested <strong>${esc(a.treatment)}</strong> through the website. Please call them to confirm a time.`,
      reference: a.reference,
      body,
      note: 'The patient has been sent an acknowledgement that says the appointment is not confirmed until they hear from you.',
    }),
    attachments: logoAttachment,
  })
}

/** Acknowledgement to the patient. Deliberately does NOT confirm the appointment. */
export async function sendPatientConfirmation(a: AppointmentRequest) {
  const first = firstName(a.fullName)

  const body = `
    ${tiles([
      tile('📅', 'Preferred date', esc(formatDate(a.preferredDate))),
      tile('🕒', 'Preferred time', esc(slotLabel(a.preferredTime))),
      tile('🦷', 'Treatment / reason', esc(a.treatment)),
      tile('🔖', 'Reference', esc(a.reference)),
    ])}
    <div style="${FONT}font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#71717a;margin:22px 0 12px 0">What happens next</div>
    ${steps([
      ['We review your request', 'Our team checks the calendar for your preferred date and time.'],
      [`We call you on ${a.phone}`, 'Usually within one working day, to agree the exact time.'],
      ['Visit us', 'Bring any previous dental records, X-rays and a list of current medications.'],
    ])}
    ${buttons([
      ['Call the clinic', brand.phoneHref],
      ['Get directions', brand.directionsUrl, 'outline'],
      ['Add to calendar', calendarUrl(a, false), 'outline'],
    ])}
    <p style="${FONT}margin:14px 0 16px 0;font-size:12px;color:#71717a">The calendar entry is a placeholder for your preferred slot — we will confirm the exact time by phone.</p>`

  const text = [
    `Hello ${first},`,
    '',
    `Thank you for your appointment request (${a.reference}). Our team will call you on ${a.phone} to confirm a time. Your appointment is not confirmed until you hear from us.`,
    '',
    `Preferred date: ${formatDate(a.preferredDate)}`,
    `Preferred time: ${slotLabel(a.preferredTime)}`,
    `Treatment / reason: ${a.treatment}`,
    '',
    'What happens next: we review your request, call you to agree the exact time, then see you at the clinic.',
    '',
    `Call us: ${brand.phone}`,
    `Directions: ${brand.directionsUrl}`,
    `Add to calendar (tentative): ${calendarUrl(a, false)}`,
    '',
    `${brand.name} · ${brand.address}`,
    ...brand.hours,
    '',
    'Need to change something? Just reply to this email.',
  ].join('\n')

  return getTransporter().sendMail({
    from: env.mail.from || `${brand.name} <no-reply@localhost>`,
    to: `${a.fullName} <${a.email}>`,
    // Patient replies go straight to the clinic inbox.
    replyTo: brand.email,
    subject: `We received your appointment request · ${a.reference}`,
    text,
    html: layout({
      preheader: `Thanks ${first} — we will call you on ${a.phone} to confirm your ${a.treatment} appointment.`,
      eyebrow: 'Appointment request received',
      title: `Thanks, ${first} — we've got your request`,
      intro: `Our team will call you on <strong>${esc(a.phone)}</strong> to confirm a time. <strong>Your appointment is not confirmed until you hear from us.</strong>`,
      reference: a.reference,
      body,
      note: 'Need to change something? Just reply to this email and it reaches the clinic team.',
    }),
    attachments: logoAttachment,
  })
}
