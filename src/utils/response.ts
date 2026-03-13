/**
 * @file response.ts
 * @description Helpers that enforce a consistent API response shape.
 *
 * WHY USE HELPERS INSTEAD OF res.json() DIRECTLY?
 * ─────────────────────────────────────────────────
 * Without helpers, every developer on your team formats responses differently:
 *   res.json({ data: users })
 *   res.json({ result: users, ok: true })
 *   res.json(users)
 *
 * With helpers, every response is identical and predictable:
 *   sendSuccess(res, users)
 *   → { "success": true, "statusCode": 200, "data": [...] }
 *
 * RESPONSE SHAPES
 * ───────────────
 * Success:
 *   { "success": true,  "statusCode": 200, "data": { ... } }
 *   { "success": true,  "statusCode": 201, "message": "Created", "data": { ... } }
 *
 * Error (handled in error.middleware.ts):
 *   { "success": false, "statusCode": 404, "message": "User not found." }
 *   { "success": false, "statusCode": 400, "message": "...", "details": { ... } }
 *
 * @example
 * import { sendSuccess, sendNoContent } from '@utils/response'
 *
 * sendSuccess(res, users)                              // 200 with data
 * sendSuccess(res, user, HTTP_STATUS.CREATED, 'User created successfully.')
 * sendNoContent(res)                                   // 204 for DELETE
 */

import type { Response } from 'express';

import { HTTP_STATUS, type HttpStatusCode } from '@constants/httpStatus';

interface SuccessPayload<T> {
  success: true;
  statusCode: HttpStatusCode;
  message?: string;
  data: T;
}

/**
 * Send a standardised success response.
 * @param res      - Express Response object
 * @param data     - Payload to include under the "data" key
 * @param statusCode - HTTP status (default: 200)
 * @param message  - Optional human-readable message (useful for 201 Created)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: HttpStatusCode = HTTP_STATUS.OK,
  message?: string,
): void {
  const payload: SuccessPayload<T> = { success: true, statusCode, data };
  if (message) payload.message = message;
  res.status(statusCode).json(payload);
}

/**
 * Send a 204 No Content response (used for DELETE endpoints).
 * No body is returned — this is correct HTTP behaviour for deletions.
 */
export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS.NO_CONTENT).send();
}
