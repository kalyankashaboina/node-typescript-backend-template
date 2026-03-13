/**
 * @file user.service.ts
 * @description Business logic layer for the User resource.
 *
 * WHAT IS A SERVICE?
 * ──────────────────
 * The service layer sits between controllers and repositories.
 * It contains ALL the business rules and logic.
 *
 * A service:
 *   ✅ Calls repository methods to read/write data
 *   ✅ Enforces business rules ("email must be unique", "can't delete admin")
 *   ✅ Throws AppError when something violates a rule
 *   ✅ Can call other services (e.g. UserService calls EmailService)
 *
 * A service does NOT:
 *   ❌ Know about HTTP (no req, res, status codes)
 *   ❌ Read from req.body or req.params directly
 *   ❌ Call res.json() or res.status()
 *
 * WHY THIS SEPARATION?
 * ─────────────────────
 * Business logic in controllers → impossible to test without HTTP
 * Business logic in services    → testable with plain function calls
 *
 * Your Jest tests can call UserService.create({ name, email }) directly,
 * with no Express request/response objects needed.
 */

import { UserRepository, type User } from '@repositories/user.repository';
import { AppError } from '@errors/AppError';
import { ERROR_MESSAGES } from '@constants/errorMessages';
import type { CreateUserInput, UpdateUserInput } from '@validations/user.validation';

// ── Service Functions ─────────────────────────────────────────────────────────

/** Return all users */
async function getAll(): Promise<User[]> {
  return UserRepository.findAll();
}

/** Get a single user by ID — throws 404 if not found */
async function getById(id: string): Promise<User> {
  const user = await UserRepository.findById(id);
  if (!user) throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  return user;
}

/**
 * Create a new user.
 * Business rule: email must be unique across all users.
 */
async function create(input: CreateUserInput): Promise<User> {
  const existing = await UserRepository.findByEmail(input.email);
  if (existing) throw AppError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);

  return UserRepository.create(input);
}

/**
 * Update a user by ID.
 * Business rules:
 * - User must exist (throws 404)
 * - If email is being changed, the new email must not already be taken
 */
async function update(id: string, input: UpdateUserInput): Promise<User> {
  const existing = await UserRepository.findById(id);
  if (!existing) throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  if (input.email && input.email !== existing.email) {
    const emailTaken = await UserRepository.findByEmail(input.email);
    if (emailTaken) throw AppError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
  }

  const updated = await UserRepository.update(id, input);
  if (!updated) throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  return updated;
}

/**
 * Delete a user by ID.
 * Business rule: user must exist (throws 404 if not found).
 */
async function remove(id: string): Promise<void> {
  const deleted = await UserRepository.remove(id);
  if (!deleted) throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
}

// ── Export as a namespace object ──────────────────────────────────────────────

export const UserService = { getAll, getById, create, update, remove };
