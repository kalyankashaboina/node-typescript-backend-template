/**
 * @file requestId.middleware.ts
 * @description Stamps a unique UUID on every incoming request.
 *
 * WHY THIS MATTERS
 * ────────────────
 * Without request IDs, debugging is painful. When 1000 requests hit your
 * server simultaneously, log lines are interleaved with no way to trace
 * which log belongs to which request.
 *
 * With request IDs, every log line for a single request shares the same ID:
 *   [abc-123] → "GET /users"
 *   [abc-123] → "Querying user repository"
 *   [abc-123] → "200 OK — 12ms"
 *
 * HOW IT WORKS
 * ────────────
 * 1. Checks if the incoming request already has an X-Request-Id header
 *    (set by an upstream proxy/gateway like Nginx or AWS ALB).
 * 2. If not, generates a fresh UUID v4.
 * 3. Attaches it to req.id (declared in src/types/express.d.ts).
 * 4. Returns it in the X-Request-Id response header so clients can reference it.
 * 5. Pino HTTP logger picks up req.id automatically — no extra code needed.
 *
 * REGISTRATION: Must be the FIRST middleware in app.ts.
 */

import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existing = req.headers['x-request-id'];
  const id = (typeof existing === 'string' && existing.length > 0) ? existing : uuidv4();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
