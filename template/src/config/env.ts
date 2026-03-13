/**
 * @file env.ts
 * @description Single source of truth for ALL environment variables.
 *
 * HOW IT WORKS
 * ────────────
 * 1. dotenv loads your .env file into process.env at startup.
 * 2. Zod validates every variable against this schema.
 * 3. If anything is missing or wrong → the app CRASHES with a clear message.
 *    This is intentional. A misconfigured app should never silently start.
 *
 * HOW TO ADD A NEW ENV VAR
 * ────────────────────────
 * 1. Add it to the schema below (with type + default if optional).
 * 2. Add it to .env.example with a comment.
 * 3. Use it anywhere: import { env } from '@config/env'
 *
 * @example
 * import { env, isDev } from '@config/env'
 * console.log(env.PORT)   // number, never undefined
 * if (isDev) { ... }
 */

import 'dotenv/config';

import { z } from 'zod';

// ─── Schema Definition ────────────────────────────────────────────────────────

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(5000),
  // z.coerce.number() converts the string "5000" → number 5000 automatically

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  ALLOWED_ORIGINS: z
    .string()
    .default('*')
    .transform((val) => val.split(',').map((s) => s.trim())),
  // "http://localhost:3000,https://myapp.com" → ['http://localhost:3000', 'https://myapp.com']

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000), // 1 min
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // ── Add your own vars below ─────────────────────────────────────────────
  // DATABASE_URL: z.string().url(),
  // JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  // REDIS_URL: z.string().url().optional(),
});

// ─── Parse & Validate ─────────────────────────────────────────────────────────

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌  Invalid or missing environment variables:\n');
  console.error(parsed.error.flatten().fieldErrors);
  console.error('\n👉  Copy .env.example → .env and fill in the values.\n');
  process.exit(1);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const env = parsed.data;

/** true when NODE_ENV === 'development' */
export const isDev = env.NODE_ENV === 'development';

/** true when NODE_ENV === 'production' */
export const isProd = env.NODE_ENV === 'production';

/** true when NODE_ENV === 'test' */
export const isTest = env.NODE_ENV === 'test';
