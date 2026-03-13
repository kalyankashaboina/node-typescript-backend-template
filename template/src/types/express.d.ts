/**
 * @file express.d.ts
 * @description Augments Express's built-in Request type with custom fields.
 *
 * WHY THIS FILE EXISTS
 * ────────────────────
 * Express's Request type is a plain object. When middleware adds custom
 * properties (like req.id from requestId.middleware), TypeScript doesn't
 * know about them and shows a type error.
 *
 * By declaring them here, TypeScript understands req.id everywhere —
 * no need to cast or use 'as any'.
 *
 * This file is auto-included by TypeScript (via tsconfig.json include) —
 * you never need to import it manually.
 */

import 'express';

declare global {
  namespace Express {
    interface Request {
      /**
       * Unique UUID stamped by requestId.middleware on every incoming request.
       * Always present after the requestIdMiddleware runs.
       */
      id: string;

      // ── Uncomment when you add authentication ──────────────────────────────
      // /** Authenticated user — populated by auth.middleware */
      // user?: {
      //   id: string;
      //   email: string;
      //   role: 'admin' | 'user';
      // };
    }
  }
}
