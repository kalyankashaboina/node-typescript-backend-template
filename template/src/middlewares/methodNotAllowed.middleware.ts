/**
 * @file methodNotAllowed.middleware.ts
 * @description Returns 405 when a route exists but the HTTP method doesn't.
 *
 * THE PROBLEM
 * ───────────
 * By default, Express returns 404 for both:
 *   - GET /nonexistent-route    → correct, route doesn't exist
 *   - DELETE /api/v1/users      → wrong, route exists but DELETE isn't supported
 *
 * A proper REST API returns 405 Method Not Allowed for the second case.
 * This tells clients "the URL is valid, but use a different HTTP method."
 *
 * HOW TO USE
 * ──────────
 * Add it at the END of each router, after all valid route definitions:
 *
 * @example
 * // In user.routes.ts:
 * router.get('/',    asyncHandler(UserController.getAll))
 * router.post('/',   asyncHandler(UserController.create))
 *
 * // Catch all other methods on these paths → 405
 * router.all('/', methodNotAllowed)
 * router.all('/:id', methodNotAllowed)
 */

import type { Request, Response, NextFunction } from 'express';

import { HTTP_STATUS } from '@constants/httpStatus';
import { ERROR_MESSAGES } from '@constants/errorMessages';

export function methodNotAllowed(_req: Request, res: Response, _next: NextFunction): void {
  res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
    success: false,
    statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
    message: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
  });
}
