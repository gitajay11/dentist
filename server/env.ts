/**
 * Environment configuration for the API server.
 *
 * Values come from process.env (load a .env file with `node --env-file=.env`).
 * See .env.example for every variable. Secrets never leave the server.
 */

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Printing emails to the console instead of sending them must be opted into,
 * never inferred.
 *
 * Inferring it from NODE_ENV or a platform flag is unsafe: Vercel exposes
 * neither to the function runtime by default, so a deploy that forgot its SMTP
 * settings would quietly "send" to the log and tell patients their request was
 * received. Local development sets MAIL_TRANSPORT=console in .env; anything
 * else refuses to accept a booking it cannot deliver.
 */
const consoleMailAllowed = optional('MAIL_TRANSPORT').toLowerCase() === 'console'

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
  consoleMailAllowed,
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
  },

  rateLimit: {
    windowMs: int('RATE_LIMIT_WINDOW_MINUTES', 15) * 60 * 1000,
    max: int('RATE_LIMIT_MAX', 5),
  },
}

/** True when SMTP is fully configured; otherwise mail can only go to the console. */
export const smtpConfigured = Boolean(env.smtp.host && env.mail.from && env.mail.to.length > 0)

/**
 * Environment variables that must be set before the site can email anyone.
 * Empty only when MAIL_TRANSPORT=console has explicitly opted out of sending.
 */
export function missingProductionConfig(): string[] {
  if (env.consoleMailAllowed) return []
  const missing: string[] = []
  if (!env.smtp.host) missing.push('SMTP_HOST')
  if (!env.mail.from) missing.push('MAIL_FROM')
  if (env.mail.to.length === 0) missing.push('MAIL_TO')
  return missing
}

/**
 * Fail fast in production rather than silently dropping appointment requests.
 * Used by the long-running server; serverless answers with a 503 instead so the
 * cause is visible in the response rather than only in the function logs.
 */
export function assertProductionConfig(): void {
  const missing = missingProductionConfig()
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`)
  }
}
