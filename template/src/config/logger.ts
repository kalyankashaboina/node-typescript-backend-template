/**
 * @file logger.ts
 * @description Application-wide structured logger powered by Pino.
 *
 * IN DEVELOPMENT  → pino-pretty: colourised, human-readable, one line per log
 *                   e.g.  14:32:05  INFO   GET /api/v1/users 200  12ms
 *
 * IN PRODUCTION   → raw JSON to stdout, one object per line — ready for
 *                   Datadog, Splunk, AWS CloudWatch, Grafana Loki, etc.
 *
 * HTTP request/response logging is handled by pinoHttp in app.ts.
 * The same transport is shared so dev HTTP logs are also human-readable.
 *
 * USAGE
 * ─────
 * import { logger } from '@config/logger'
 *
 * logger.info('Server started')
 * logger.info({ userId: '123' }, 'User logged in')
 * logger.warn({ threshold: 100 }, 'Memory high')
 * logger.error({ err }, 'Database connection failed')
 */

import pino from 'pino';
import { env, isDev } from '@config/env';

// ── Dev transport — pretty, colourised, human-readable ────────────────────────
//
// messageFormat controls what appears on each log line in dev.
// We show: timestamp  LEVEL  message  — plus any extra context fields inline.
//
// The HTTP log line produced by pinoHttp will look like:
//   14:32:05  INFO   GET /api/v1/users 200  12ms
//
const devTransport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize:      true,
    translateTime: 'HH:MM:ss',
    ignore:        'pid,hostname,req,res,responseTime',   // suppress raw JSON blobs
    messageFormat: '{msg}{if responseTime}  {responseTime}ms{end}',
    singleLine:    true,   // one clean line per request in dev
  },
});

// ── Production options — JSON + sensitive-field redaction ─────────────────────
const prodOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  redact: {
    paths:  ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[REDACTED]',
  },
};

// ── Dev options — let pino-pretty handle formatting ───────────────────────────
const devOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
};

export const logger = pino(
  isDev ? devOptions : prodOptions,
  isDev ? devTransport : undefined,   // no transport in prod → raw JSON to stdout
);
