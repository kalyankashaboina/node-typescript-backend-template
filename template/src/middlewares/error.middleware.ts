/**
 * @file error.middleware.ts
 * @description The global error handler — the LAST middleware in app.ts.
 *
 * HOW EXPRESS ERROR HANDLING WORKS
 * ──────────────────────────────────
 * Any middleware that calls next(err) — or any async handler that throws
 * (when wrapped with asyncHandler) — skips all normal middleware and lands here.
 *
 * Express recognises this as an error handler because it has FOUR parameters.
 * The signature (err, req, res, next) is required — even if _next is unused.
 *
 * WHAT THIS HANDLER DOES
 * ──────────────────────
 * 1. ZodError         → 400 Bad Request with field-level validation details
 * 2. AppError (operational) → use its statusCode + message (safe to expose)
 * 3. Everything else  → generic 500 (never leak internal error details to client)
 *
 * In all cases: log the error with the request ID for traceability.
 *
 * REGISTRATION: Must be the LAST app.use() call in app.ts — after all routes.
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { logger } from '@config/logger';
import { isProd } from '@config/env';
import { AppError } from '@errors/AppError';
import { HTTP_STATUS } from '@constants/httpStatus';
import { ERROR_MESSAGES } from '@constants/errorMessages';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction): void {

  // ── 1. Zod Validation Error ───────────────────────────────────────────────
  // Thrown when req.body fails schema validation in a controller
  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      details: err.flatten().fieldErrors,
      // Example details: { email: ['Invalid email'], name: ['Required'] }
    });
    return;
  }

  // ── 2. Known Operational Error (AppError) ────────────────────────────────
  // These are expected: 404 not found, 401 unauthorized, 409 conflict, etc.
  if (err instanceof AppError && err.isOperational) {
    logger.warn({ requestId: req.id, statusCode: err.statusCode }, err.message);
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  // ── 3. Unknown / Programmer Error ────────────────────────────────────────
  // These are bugs: null pointer, failed DB query, etc.
  // Log the full error internally — NEVER expose stack traces to clients.
  logger.error({ requestId: req.id, err }, 'Unhandled error');

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    // Show stack trace only in non-production for easier local debugging
    ...(!isProd && err instanceof Error ? { stack: err.stack } : {}),
  });
}
