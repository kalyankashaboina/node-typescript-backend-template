/**
 * @file httpStatus.ts
 * @description Centralised HTTP status codes as named constants.
 *
 * WHY NOT MAGIC NUMBERS?
 * ──────────────────────
 * res.status(404)     → What does 404 mean? You have to remember.
 * res.status(HTTP_STATUS.NOT_FOUND) → Self-documenting, impossible to typo.
 *
 * @example
 * import { HTTP_STATUS } from '@constants/httpStatus'
 * res.status(HTTP_STATUS.CREATED).json(...)
 */

export const HTTP_STATUS = {
  // 2xx — Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx — Redirection
  NOT_MODIFIED: 304,

  // 4xx — Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx — Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Type: exactly 200 | 201 | 204 | 400 | ... — not a generic number
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
