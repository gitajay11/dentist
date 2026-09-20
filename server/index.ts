/**
 * Appointment API + (in production) static host for the built site.
 *
 *   npm run dev:api   → API only on :8787 (Vite proxies /api to it)
 *   npm start         → serves dist/ and /api from one process
 *
 * Runs directly on Node ≥ 22.18 / 24 via native type stripping — no build step.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import express, { type NextFunction, type Request, type Response } from 'express'
import { handleAppointment } from './appointments.ts'
import { assertProductionConfig, env } from './env.ts'
import { verifyTransport } from './mailer.ts'
import { createRateLimiter } from './rateLimit.ts'

assertProductionConfig()

const app = express()
app.disable('x-powered-by')
if (env.trustProxy) app.set('trust proxy', 1)

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
  res.json({ ok: true, uptime: Math.round(process.uptime()) })
})

api.post('/appointments', createRateLimiter(env.rateLimit), handleAppointment)

api.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Not found.' })
})

app.use('/api', api)

/* ---------- static site (production) ---------- */
const dist = path.resolve(process.cwd(), 'dist')
if (env.isProduction) {
  if (!existsSync(dist)) {
    console.warn('[static] dist/ not found — run `npm run build` first. Serving API only.')
  } else {
    app.use(express.static(dist, { maxAge: '1y', index: false, immutable: true }))
    app.get('/{*splat}', (req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
      res.setHeader('Cache-Control', 'no-cache')
      res.sendFile(path.join(dist, 'index.html'))
    })
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

/* ---------- start ---------- */
const server = app.listen(env.port, async () => {
  console.log(`[server] listening on http://localhost:${env.port} (${env.isProduction ? 'production' : 'development'})`)
  try {
    await verifyTransport()
  } catch (err) {
    console.error('[mail] SMTP verification failed — appointment emails will not send until this is fixed:', err)
  }
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
