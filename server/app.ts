/**
 * The Express application, with no listener attached.
 *
 * Two things run it:
 *   server/index.ts  → a long-running process (npm run dev:api / npm start)
 *   api/index.ts     → a Vercel Serverless Function (production on Vercel)
 *
 * Keeping the app free of `listen()` is what lets one codebase serve both.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import express, { type NextFunction, type Request, type Response } from 'express'
import { handleAppointment } from './appointments.ts'
import { env, missingProductionConfig, smtpConfigured } from './env.ts'
import { createRateLimiter } from './rateLimit.ts'

/** True on Vercel, where the CDN serves the site and the function only answers /api. */
export const onVercel = Boolean(process.env.VERCEL)

const app = express()
app.disable('x-powered-by')

// Vercel always sits behind its proxy, so client IPs arrive via X-Forwarded-For.
if (env.trustProxy || onVercel) app.set('trust proxy', 1)

/* ---------- security headers & optional CORS ---------- */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  const origin = req.headers.origin
  if (origin && env.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }
  }
  next()
})

/* ---------- API ---------- */
const api = express.Router()
api.use(express.json({ limit: '16kb' }))

api.get('/health', (_req, res) => {
  const missing = missingProductionConfig()
  res.json({
    ok: missing.length === 0,
    uptime: Math.round(process.uptime()),
    // Booleans only — never the values themselves.
    mail: {
      smtpConfigured,
      consoleTransport: env.consoleMailAllowed,
      patientConfirmation: env.mail.sendPatientConfirmation,
    },
    ...(missing.length > 0 ? { missingConfig: missing } : {}),
  })
})

// A misconfigured deploy must never accept a booking it cannot deliver. Say so
// in the response body, so the cause is obvious without reading function logs.
api.post('/appointments', (_req, res, next) => {
  const missing = missingProductionConfig()
  if (missing.length === 0) return next()
  console.error(`[appointments] refused — missing environment variables: ${missing.join(', ')}`)
  res.status(503).json({
    ok: false,
    message: 'Online booking is not available right now. Please call the clinic to book.',
    missingConfig: missing,
  })
})

api.post('/appointments', createRateLimiter(env.rateLimit), handleAppointment)

api.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Not found.' })
})

app.use('/api', api)

/* ---------- static site (self-hosted only; on Vercel the CDN serves dist/) ---------- */
const dist = path.resolve(process.cwd(), 'dist')
if (!onVercel) {
  if (existsSync(dist)) {
    app.use(express.static(dist, { maxAge: '1y', index: false, immutable: true }))
    app.get('/{*splat}', (req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
      res.setHeader('Cache-Control', 'no-cache')
      res.sendFile(path.join(dist, 'index.html'))
    })
  } else {
    console.warn('[static] dist/ not found — run `npm run build` to serve the site from this server too. Serving API only.')
  }
}

/* ---------- error handling ---------- */
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err === 'object' && err && 'status' in err ? Number((err as { status: unknown }).status) : 500
  if (status >= 500) console.error('[server] unhandled error:', err)
  const message =
    status === 400 ? 'Malformed request body.' : status === 413 ? 'Request too large.' : 'Something went wrong.'
  if (req.path.startsWith('/api/')) res.status(status).json({ ok: false, message })
  else res.status(status).type('text').send(message)
})

export { app, dist }
