/**
 * @file user.validation.ts
 * @description Zod schemas for validating all User-related request data.
 *
 * WHY ZOD FOR VALIDATION?
 * ───────────────────────
 * Zod validates AND infers TypeScript types from a single schema definition.
 * You write the schema once and get both runtime validation and static types.
 *
 *   const schema = z.object({ name: z.string() })
 *   type Input = z.infer<typeof schema>  // → { name: string }
 *
 * Compare this to writing a separate interface AND a validation function —
 * with Zod you do it in one declaration.
 *
 * HOW TO ADD A NEW RESOURCE
 * ─────────────────────────
 * Copy this file pattern for every new resource (product, order, etc.):
 * 1. Define schemas for Create, Update, and Params (id).
 * 2. Export inferred TypeScript types.
 * 3. Use them in the controller: createUserSchema.parse(req.body)
 *
 * WHERE VALIDATION HAPPENS
 * ────────────────────────
 * Validation is done in the controller layer — NOT middleware.
 * This keeps each layer's responsibility clear:
 *   Controller → validate input, call service, send response
 *   Service    → business logic only
 *   Repository → data access only
 */

import { z } from 'zod';

// ── Create User ───────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must be at most 100 characters.')
    .trim(),

  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.')
    .toLowerCase()
    .trim(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
// → { name: string; email: string }

// ── Update User ───────────────────────────────────────────────────────────────
// .partial() makes all fields optional — perfect for PATCH endpoints

export const updateUserSchema = createUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field (name or email) must be provided.' },
);

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
// → { name?: string; email?: string }

// ── URL Parameters ────────────────────────────────────────────────────────────

export const userIdParamSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID.'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
// → { id: string }
