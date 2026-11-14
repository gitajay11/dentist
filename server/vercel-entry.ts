/**
 * Vercel Serverless Function entry point.
 *
 * vercel.json rewrites every /api/* request here; the Express app in
 * server/app.ts handles the routing from there. The static site is served by
 * Vercel's CDN from dist/, so this function only ever answers API calls.
 *
 * Required environment variables (Project Settings → Environment Variables):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO
 * Without them /api/appointments answers 503 and names what is missing.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { app } from './app.ts'

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // The router is mounted at /api. Vercel normally forwards the original URL,
  // but a rewrite can present the path with the prefix already stripped —
  // restore it so both shapes route identically.
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`
  }
  return app(req, res)
}
