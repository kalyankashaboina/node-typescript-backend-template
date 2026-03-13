/**
 * @file rateLimiter.middleware.ts
 * @description Protects the API from abuse using express-rate-limit.
 *
 * WHY RATE LIMITING?
 * ──────────────────
 * Without rate limiting, a single bad actor can:
 *   - Flood your server with thousands of requests per second (DoS attack)
 *   - Brute-force login endpoints
 *   - Scrape your entire database
 *   - Run up your cloud bill
 *
 * With rate limiting, you cap how many requests a single IP can make
 * within a time window. Legitimate users are unaffected.
 *
 * CONFIGURATION (via .env)
 * ────────────────────────
 * RATE_LIMIT_WINDOW_MS=60000   ← 1 minute window
 * RATE_LIMIT_MAX=100           ← max 100 requests per IP per window
 *
 * EXPORTS
 * ───────
 * globalLimiter  → applied to ALL routes in app.ts
 * strictLimiter  → applied to sensitive routes (auth, payments) — tighter limits
 *
 * @example
 * // In routes/auth.routes.ts:
 * import { strictLimiter } from '@middlewares/rateLimiter.middleware'
 * router.post('/login', strictLimiter, asyncHandler(AuthController.login))
 */

import rateLimit from 'express-rate-limit';

import { env } from '@config/env';
import { HTTP_STATUS } from '@constants/httpStatus';
import { ERROR_MESSAGES } from '@constants/errorMessages';

// ── Global Limiter — applied to all routes ───────────────────────────────────

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,  // Adds RateLimit-* headers to responses
  legacyHeaders: false,   // Disables the old X-RateLimit-* headers
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
  },
  skip: (req) => req.path === '/health', // Never rate-limit health checks
});

// ── Strict Limiter — for sensitive endpoints ─────────────────────────────────
// Use on: /auth/login, /auth/register, /auth/forgot-password, etc.

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Only 10 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many attempts. Please wait 15 minutes before trying again.',
  },
});
