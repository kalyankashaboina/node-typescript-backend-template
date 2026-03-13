/**
 * @file asyncHandler.ts
 * @description Wraps async route handlers so errors are forwarded automatically.
 *
 * THE PROBLEM
 * ───────────
 * Express does NOT catch async errors by default. If an async controller
 * throws, Express never knows, the request hangs, and eventually times out.
 *
 * Without asyncHandler (BAD — you'd need this in EVERY controller):
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ router.get('/users', async (req, res, next) => {                 │
 * │   try {                                                          │
 * │     const users = await UserService.getAll()                     │
 * │     res.json(users)                                              │
 * │   } catch (err) {                                                │
 * │     next(err)   ← you must write this in EVERY handler           │
 * │   }                                                              │
 * │ })                                                               │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * With asyncHandler (CLEAN — no try/catch in controllers at all):
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ router.get('/users', asyncHandler(UserController.getAll))        │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Any error thrown inside the handler → forwarded to error.middleware.ts.
 *
 * @example
 * import { asyncHandler } from '@utils/asyncHandler'
 * router.get('/users', asyncHandler(UserController.getAll))
 * router.post('/users', asyncHandler(UserController.create))
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
    //                                        ↑
    //                    Forwards any error to the global error handler
  };
