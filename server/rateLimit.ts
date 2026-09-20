import type { NextFunction, Request, Response } from 'express'

/**
 * Small in-memory rate limiter — enough for a single-instance clinic site.
 * If you scale to several instances, swap this for a shared store (Redis).
 */
export function createRateLimiter(options: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>()

  // Drop stale entries periodically so the map cannot grow unbounded.
  const sweep = setInterval(() => {
    const cutoff = Date.now() - options.windowMs
    for (const [key, times] of hits) {
      const recent = times.filter((t) => t > cutoff)
      if (recent.length === 0) hits.delete(key)
      else hits.set(key, recent)
    }
  }, options.windowMs)
  sweep.unref()

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const key = req.ip ?? 'unknown'
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((t) => t > now - options.windowMs)

    if (recent.length >= options.max) {
      const retryAfterSec = Math.ceil((recent[0] + options.windowMs - now) / 1000)
      res.setHeader('Retry-After', String(retryAfterSec))
      res.status(429).json({
        ok: false,
        message: 'Too many requests from your connection. Please try again in a few minutes.',
      })
      return
    }

    recent.push(now)
    hits.set(key, recent)
    next()
  }
}
