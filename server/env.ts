/**
 * Environment configuration for the API server.
 *
 * Values come from process.env (load a .env file with `node --env-file=.env`).
 * See .env.example for every variable. Secrets never leave the server.
 */

const isProduction = process.env.NODE_ENV === 'production'

function optional(name: string, fallback = ''): string {
  return (process.env[name] ?? fallback).trim()
}

function bool(name: string, fallback: boolean): boolean {
  const v = optional(name)
  if (!v) return fallback
  return /^(1|true|yes|on)$/i.test(v)
}

function int(name: string, fallback: number): number {
  const v = Number.parseInt(optional(name), 10)
  return Number.isFinite(v) ? v : fallback
}

function list(name: string): string[] {
  return optional(name)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export const env = {
  isProduction,
  port: int('PORT', 8787),
  /** Set when a reverse proxy (nginx, Render, Fly, …) sits in front of Node. */
  trustProxy: bool('TRUST_PROXY', false),
  /** Only needed when the frontend is hosted on a different origin. */
  allowedOrigins: list('ALLOWED_ORIGIN'),

  smtp: {
    host: optional('SMTP_HOST'),
    port: int('SMTP_PORT', 587),
    secure: bool('SMTP_SECURE', false),
    user: optional('SMTP_USER'),
    pass: optional('SMTP_PASS'),
  },

  mail: {
    from: optional('MAIL_FROM'),
    to: list('MAIL_TO'),
    sendPatientConfirmation: bool('SEND_PATIENT_CONFIRMATION', true),
    clinicName: optional('CLINIC_NAME', 'Care Dental'),
    clinicPhone: optional('CLINIC_PHONE', '[+91 00000 00000]'),
  },

  rateLimit: {
    windowMs: int('RATE_LIMIT_WINDOW_MINUTES', 15) * 60 * 1000,
    max: int('RATE_LIMIT_MAX', 5),
  },
}

/** True when SMTP is fully configured. In dev we fall back to console output. */
export const smtpConfigured = Boolean(env.smtp.host && env.mail.from && env.mail.to.length > 0)

/** Fail fast in production rather than silently dropping appointment requests. */
export function assertProductionConfig(): void {
  if (!env.isProduction) return
  const missing: string[] = []
  if (!env.smtp.host) missing.push('SMTP_HOST')
  if (!env.mail.from) missing.push('MAIL_FROM')
  if (env.mail.to.length === 0) missing.push('MAIL_TO')
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`)
  }
}
