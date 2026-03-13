/**
 * @file logger.ts
 * @description Application-wide structured logger powered by Pino.
 *
 * WHY PINO OVER console.log
 * ─────────────────────────
 * console.log()  → plain string, hard to search, no structure, synchronous
 * pino logger    → structured JSON, searchable fields, async, 5-10x faster
 *
 * IN DEVELOPMENT  → pretty-prints with colours and timestamps (human readable)
 * IN PRODUCTION   → outputs raw JSON (one line per log) for aggregators like
 *                   Datadog, Splunk, AWS CloudWatch, Grafana Loki, etc.
 *
 * USAGE
 * ─────
 * import { logger } from '@config/logger'
 *
 * logger.info('Server started')
 * logger.info({ userId: '123' }, 'User logged in')     // structured context
 * logger.warn({ threshold: 100 }, 'Memory high')
 * logger.error({ err }, 'Database connection failed')  // err auto-serialised
 *
 * HTTP request logging is handled by pinoHttp in app.ts automatically.
 */

import pino from 'pino';

import { env, isDev } from '@config/env';

export const logger = pino(
  {
    level: env.LOG_LEVEL,
  },
  isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          // Clean single-line format: timestamp level message
          messageFormat: '{msg}',
          singleLine: false,
        },
      })
    : undefined,
);
