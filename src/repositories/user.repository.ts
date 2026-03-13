/**
 * @file user.repository.ts
 * @description Data access layer for the User resource.
 *
 * WHAT IS A REPOSITORY?
 * ──────────────────────
 * The repository is the ONLY layer that talks to your data source
 * (database, file, in-memory store, external API — anything).
 *
 * It contains zero business logic. It only:
 *   - Reads data    (findById, findAll, findByEmail)
 *   - Writes data   (create, update, delete)
 *
 * WHY THIS SEPARATION?
 * ─────────────────────
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Today:   in-memory Map (simple, no setup, great for demos)  │
 * │ Tomorrow: swap to Prisma, Mongoose, TypeORM, raw SQL        │
 * │ Result:  ONLY this file changes. Controllers and services   │
 * │          stay exactly the same.                             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * SWAPPING TO A REAL DATABASE (example: Prisma)
 * ─────────────────────────────────────────────
 * 1. Install Prisma:  npm install @prisma/client
 * 2. Replace the in-memory store below with Prisma client calls:
 *      findById(id) → return prisma.user.findUnique({ where: { id } })
 * 3. Nothing else in the codebase needs to change.
 */

import { v4 as uuidv4 } from 'uuid';

import type { CreateUserInput, UpdateUserInput } from '@validations/user.validation';

// ── User Type ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── In-Memory Store (replace with real DB calls when ready) ───────────────────
// Using a Map for O(1) lookups by ID.

const store = new Map<string, User>();

// ── Repository Functions ──────────────────────────────────────────────────────

/** Return all users as an array */
async function findAll(): Promise<User[]> {
  return Array.from(store.values());
}

/** Find a single user by ID — returns null if not found */
async function findById(id: string): Promise<User | null> {
  return store.get(id) ?? null;
}

/** Find a user by email — used to check for duplicates */
async function findByEmail(email: string): Promise<User | null> {
  for (const user of store.values()) {
    if (user.email === email) return user;
  }
  return null;
}

/** Create and persist a new user */
async function create(input: CreateUserInput): Promise<User> {
  const now = new Date();
  const user: User = {
    id: uuidv4(),
    name: input.name,
    email: input.email,
    createdAt: now,
    updatedAt: now,
  };
  store.set(user.id, user);
  return user;
}

/** Update an existing user — returns null if not found */
async function update(id: string, input: UpdateUserInput): Promise<User | null> {
  const existing = store.get(id);
  if (!existing) return null;

  const updated: User = {
    ...existing,
    ...input,
    updatedAt: new Date(),
  };
  store.set(id, updated);
  return updated;
}

/** Delete a user — returns true if deleted, false if not found */
async function remove(id: string): Promise<boolean> {
  return store.delete(id);
}

// ── Export as a namespace object ──────────────────────────────────────────────

export const UserRepository = { findAll, findById, findByEmail, create, update, remove };
