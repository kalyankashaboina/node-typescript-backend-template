/**
 * @file AppError.ts
 * @description The single custom error class for the entire application.
 *
 * THE PROBLEM WITH NATIVE Error
 * ──────────────────────────────
 * The built-in Error has only a message and a stack trace.
 * It has no statusCode, no isOperational flag, no details field.
 * You can't distinguish a "User not found" (safe to show) from
 * a "Cannot read property of undefined" (must hide from clients).
 *
 * THE SOLUTION: AppError
 * ──────────────────────
 * isOperational = true  → expected error, safe to return to the client (4xx)
 * isOperational = false → programmer bug, return generic 500, log internally
 *
 * Static factory methods read better than `new AppError(msg, 404)` everywhere:
 *
 * @example
 * // In a service:
 * throw AppError.notFound('User not found.')
 * throw AppError.conflict('Email already taken.')
 * throw AppError.badRequest('Invalid input.', validationDetails)
 *
 * // The global error.middleware.ts catches it and returns the right HTTP response.
 */

import { HTTP_STATUS, type HttpStatusCode } from '@constants/httpStatus';
import { ERROR_MESSAGES } from '@constants/errorMessages';

export class AppError extends Error {
  /** HTTP status code to send in the response */
  public readonly statusCode: HttpStatusCode;

  /** true = expected error (show to client); false = bug (hide, log internally) */
  public readonly isOperational: boolean;

  /** Optional extra detail — e.g. Zod validation field errors */
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    options: { isOperational?: boolean; details?: unknown } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;

    // Restore the prototype chain — required when extending built-ins in TS
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory Methods ───────────────────────────────────────────────────────

  /** 400 Bad Request — invalid input, failed validation */
  static badRequest(message = ERROR_MESSAGES.VALIDATION_FAILED, details?: unknown) {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST, { details });
  }

  /** 401 Unauthorized — user not authenticated */
  static unauthorized(message = ERROR_MESSAGES.UNAUTHORIZED) {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  /** 403 Forbidden — user authenticated but lacks permission */
  static forbidden(message = ERROR_MESSAGES.FORBIDDEN) {
    return new AppError(message, HTTP_STATUS.FORBIDDEN);
  }

  /** 404 Not Found — resource doesn't exist */
  static notFound(message = ERROR_MESSAGES.NOT_FOUND) {
    return new AppError(message, HTTP_STATUS.NOT_FOUND);
  }

  /** 409 Conflict — duplicate resource, state conflict */
  static conflict(message: string) {
    return new AppError(message, HTTP_STATUS.CONFLICT);
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message = ERROR_MESSAGES.TOO_MANY_REQUESTS) {
    return new AppError(message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  /** 500 Internal Server Error — unexpected failure (non-operational) */
  static internal(message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR) {
    return new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      isOperational: false,
    });
  }
}
