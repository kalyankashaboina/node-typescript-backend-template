/**
 * @file auth.middleware.ts
 * @description Authentication guard — verifies the request is authenticated.
 *
 * CURRENT STATE: STUB
 * ───────────────────
 * This is a ready-to-fill stub. The structure is correct — you just need to
 * replace the TODO section with your actual token verification logic.
 *
 * HOW JWT AUTH WORKS (when you implement it)
 * ──────────────────────────────────────────
 * 1. Client logs in → server returns a signed JWT token.
 * 2. Client sends token in every request: Authorization: Bearer <token>
 * 3. This middleware extracts and verifies the token on every protected route.
 * 4. If valid → attaches user to req.user and calls next().
 * 5. If invalid/missing → throws 401 Unauthorized.
 *
 * HOW TO ACTIVATE
 * ───────────────
 * 1. Install jsonwebtoken:  npm install jsonwebtoken @types/jsonwebtoken
 * 2. Add JWT_SECRET to your .env and env.ts schema.
 * 3. Replace the TODO block below with real verification logic.
 * 4. Uncomment req.user in src/types/express.d.ts.
 * 5. Apply to routes: router.use(authenticate)
 *
 * USAGE (once implemented)
 * ────────────────────────
 * @example
 * // Protect a whole router:
 * import { authenticate } from '@middlewares/auth.middleware'
 * router.use(authenticate)
 *
 * // Protect a single route:
 * router.get('/profile', authenticate, asyncHandler(UserController.getProfile))
 */

import type { Request, Response, NextFunction } from 'express';

import { AppError } from '@errors/AppError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // ── Step 1: Extract token from Authorization header ───────────────────────
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(AppError.unauthorized('No token provided. Add Authorization: Bearer <token>'));
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    next(AppError.unauthorized('Malformed authorization header.'));
    return;
  }

  // ── TODO: Verify token ────────────────────────────────────────────────────
  // Replace this block with real JWT verification:
  //
  // import jwt from 'jsonwebtoken'
  // import { env } from '@config/env'
  //
  // try {
  //   const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string; role: string }
  //   req.user = { id: payload.id, email: payload.email, role: payload.role }
  //   next()
  // } catch {
  //   next(AppError.unauthorized('Invalid or expired token.'))
  // }

  // ── Placeholder (remove once you implement real auth above) ───────────────
  void token; // prevents "unused variable" lint error on the stub
  next(AppError.unauthorized('Auth not implemented yet. See auth.middleware.ts for instructions.'));
}
