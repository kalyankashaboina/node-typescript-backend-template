/**
 * @file app.ts
 * @description Express application factory — wires together all middleware and routes.
 *
 * WHY SEPARATE app.ts FROM server.ts?
 * ─────────────────────────────────────
 * app.ts   → Creates and configures the Express app (pure logic, no side effects)
 * server.ts → Starts the HTTP server, listens on a port, handles graceful shutdown
 *
 * This separation means your test suite can import the app and run supertest
 * requests WITHOUT starting a real HTTP server or binding to a port.
 *
 * MIDDLEWARE ORDER MATTERS
 * ────────────────────────
 * Express processes middleware in the order it is registered.
 *
 *  1. requestIdMiddleware  → stamp ID first so all logs include it
 *  2. pinoHttp             → log every request (needs the ID from step 1)
 *  3. helmet               → security headers
 *  4. cors                 → cross-origin config
 *  5. globalLimiter        → rate limiting before any parsing
 *  6. express.json()       → parse request body
 *  7. Health check         → /health (top-level, NOT under /api/v1)
 *  8. API routes           → /api/v1/...
 *  9. Swagger UI           → /api-docs
 * 10. 404 handler          → catches anything not matched above
 * 11. errorMiddleware      → MUST be last — catches all errors
 *
 * HTTP LOG FORMAT
 * ───────────────
 * Development  →  14:32:05  INFO  GET /api/v1/users 200  12ms   (human-readable)
 * Production   →  {"level":30,"time":...,"method":"GET",...}     (JSON)
 */

import express, { type Request, type Response, type IncomingMessage } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env, isDev } from '@config/env';
import { logger } from '@config/logger';
import { swaggerSpec } from '@config/swagger';
import { ROUTES } from '@constants/app.constants';
import { HTTP_STATUS } from '@constants/httpStatus';
import { requestIdMiddleware } from '@middlewares/requestId.middleware';
import { globalLimiter } from '@middlewares/rateLimiter.middleware';
import { errorMiddleware } from '@middlewares/error.middleware';
import apiRoutes from '@routes/index';

// ── Create App ────────────────────────────────────────────────────────────────

const app = express();

// ── 1. Request ID ─────────────────────────────────────────────────────────────
app.use(requestIdMiddleware);

// ── 2. HTTP Request Logging ───────────────────────────────────────────────────
//
// DEV:  Produces one clean human-readable line per request:
//         14:32:05  INFO   GET /api/v1/users 200  12ms
//
// PROD: Produces structured JSON with method, url, status, responseTime,
//       requestId — ready for log aggregators. Raw req/res bodies are never
//       logged (security + noise).
//
app.use(
  pinoHttp({
    logger,
    genReqId: (req: IncomingMessage) => (req as Request).id ?? 'unknown',

    // Map HTTP status codes to log levels
    customLogLevel: (_req, res) => {
      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },

    // Human-readable message format — pino-pretty renders this line in dev
    customSuccessMessage: (req, res) =>
      `${(req as Request).method} ${(req as Request).url} ${res.statusCode}`,
    customErrorMessage: (req, res) =>
      `${(req as Request).method} ${(req as Request).url} ${res.statusCode}`,

    // In dev: suppress the full req/res JSON objects — the message line is enough.
    // In prod: include structured fields for log aggregators.
    serializers: isDev
      ? {
          req:  () => undefined,   // don't dump the full request object
          res:  () => undefined,   // don't dump the full response object
        }
      : {
          req: (req) => ({
            id:     req.id,
            method: req.method,
            url:    req.url,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
  }),
);

// ── 3. Security Headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── 4. CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:         env.ALLOWED_ORIGINS.includes('*') ? '*' : env.ALLOWED_ORIGINS,
    methods:        ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials:    true,
  }),
);

// ── 5. Rate Limiting ──────────────────────────────────────────────────────────
app.use(globalLimiter);

// ── 6. Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── 7. Health Check — top-level route, NOT under /api/v1 ─────────────────────
/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check — confirms the server is running
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:    { type: string, example: ok }
 *                 uptime:    { type: number, example: 123.45 }
 *                 timestamp: { type: string, format: date-time }
 */
app.get(ROUTES.HEALTH, (_req: Request, res: Response) => {
  res.json({
    status:    'ok',
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── 8. API Routes — all under /api/v1 ────────────────────────────────────────
app.use(ROUTES.API_PREFIX, apiRoutes);

// ── 9. API Documentation ──────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── 10. 404 handler ───────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success:    false,
    statusCode: HTTP_STATUS.NOT_FOUND,
    message:    'Route not found. Check /api-docs for available endpoints.',
  });
});

// ── 11. Global Error Handler — MUST be last ───────────────────────────────────
app.use(errorMiddleware);

export default app;
