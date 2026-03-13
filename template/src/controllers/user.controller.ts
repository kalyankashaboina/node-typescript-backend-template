/**
 * @file user.controller.ts
 * @description HTTP layer for the User resource — parse input, call service, send response.
 *
 * WHAT IS A CONTROLLER?
 * ──────────────────────
 * The controller is the bridge between HTTP and your business logic.
 * It handles exactly three things per endpoint:
 *   1. PARSE    — extract and validate data from req (body, params, query)
 *   2. CALL     — pass validated data to the service
 *   3. RESPOND  — send the result back as an HTTP response
 *
 * A controller does NOT:
 *   ❌ Contain business logic ("is email unique?" belongs in the service)
 *   ❌ Talk to the database directly (that's the repository's job)
 *
 * ERROR HANDLING
 * ──────────────
 * All functions are wrapped with asyncHandler() in the routes file.
 * This means any thrown error (including AppError) is automatically
 * forwarded to error.middleware.ts — no try/catch needed here.
 *
 * If Zod schema.parse() fails, it throws a ZodError which is also
 * caught by asyncHandler and handled in error.middleware.ts (→ 400).
 */

import type { Request, Response } from 'express';

import { UserService } from '@services/user.service';
import { sendSuccess, sendNoContent } from '@utils/response';
import { HTTP_STATUS } from '@constants/httpStatus';
import { SUCCESS_MESSAGES } from '@constants/errorMessages';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '@validations/user.validation';

// ── GET /api/v1/users ─────────────────────────────────────────────────────────

async function getAll(_req: Request, res: Response): Promise<void> {
  const users = await UserService.getAll();
  sendSuccess(res, users);
}

// ── GET /api/v1/users/:id ─────────────────────────────────────────────────────

async function getById(req: Request, res: Response): Promise<void> {
  const { id } = userIdParamSchema.parse(req.params);
  // ↑ Throws ZodError (→ 400) if id is not a valid UUID
  const user = await UserService.getById(id);
  // ↑ Throws AppError.notFound (→ 404) if user doesn't exist
  sendSuccess(res, user);
}

// ── POST /api/v1/users ────────────────────────────────────────────────────────

async function create(req: Request, res: Response): Promise<void> {
  const input = createUserSchema.parse(req.body);
  // ↑ Throws ZodError (→ 400) if body is invalid
  const user = await UserService.create(input);
  // ↑ Throws AppError.conflict (→ 409) if email already exists
  sendSuccess(res, user, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.USER_CREATED);
}

// ── PATCH /api/v1/users/:id ───────────────────────────────────────────────────

async function update(req: Request, res: Response): Promise<void> {
  const { id } = userIdParamSchema.parse(req.params);
  const input = updateUserSchema.parse(req.body);
  const user = await UserService.update(id, input);
  sendSuccess(res, user, HTTP_STATUS.OK, SUCCESS_MESSAGES.USER_UPDATED);
}

// ── DELETE /api/v1/users/:id ──────────────────────────────────────────────────

async function remove(req: Request, res: Response): Promise<void> {
  const { id } = userIdParamSchema.parse(req.params);
  await UserService.remove(id);
  sendNoContent(res); // 204 — no body on successful deletion
}

// ── Export as namespace ───────────────────────────────────────────────────────

export const UserController = { getAll, getById, create, update, remove };
