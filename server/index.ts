/**
 * Long-running server: appointment API + the built site.
 *
 *   npm run dev:api   → API only on :8787 (Vite proxies /api to it)
 *   npm run dev:all   → this plus the Vite dev server
 *   npm start         → serves dist/ and /api from one process
 *
 * Runs directly on Node ≥ 22.18 / 24 via native type stripping — no build step.
 * On Vercel the same app is served by api/index.ts instead; see server/app.ts.
 */
import { existsSync } from 'node:fs'
import { app, dist } from './app.ts'
import { assertProductionConfig, env } from './env.ts'
import { verifyTransport } from './mailer.ts'

// A self-hosted process should refuse to start misconfigured rather than take
// bookings it cannot deliver.
assertProductionConfig()

const server = app.listen(env.port, async () => {
  console.log(
    `[server] listening on http://localhost:${env.port} (${env.isProduction ? 'production' : 'development'})${existsSync(dist) ? ' — serving site + API' : ' — API only'}`,
  )
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
