/**
 * @file user.routes.ts
 * @description Route definitions for the /users resource.
 *
 * ROUTE STRUCTURE
 * ───────────────
 * GET    /api/v1/users        → list all users
 * POST   /api/v1/users        → create a new user
 * GET    /api/v1/users/:id    → get one user by ID
 * PATCH  /api/v1/users/:id    → update a user
 * DELETE /api/v1/users/:id    → delete a user
 *
 * Each route is wrapped with asyncHandler() so any thrown error is
 * automatically forwarded to the global error handler.
 *
 * The @openapi JSDoc comments below are picked up by swagger-jsdoc
 * and rendered at /api-docs.
 *
 * HOW TO ADD A NEW ROUTE
 * ──────────────────────
 * 1. Add the handler function in user.controller.ts
 * 2. Add the route here: router.method('/path', asyncHandler(UserController.fn))
 * 3. Add the @openapi comment below
 */

import { Router } from 'express';

import { asyncHandler } from '@utils/asyncHandler';
import { UserController } from '@controllers/user.controller';
import { methodNotAllowed } from '@middlewares/methodNotAllowed.middleware';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Collection: /api/v1/users
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 statusCode: { type: integer, example: 200 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', asyncHandler(UserController.getAll));

/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 statusCode: { type: integer, example: 201 }
 *                 message: { type: string, example: 'User created successfully.' }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 */
router.post('/', asyncHandler(UserController.create));

router.all('/', methodNotAllowed);

// ─────────────────────────────────────────────────────────────────────────────
// Single resource: /api/v1/users/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', asyncHandler(UserController.getById));

/**
 * @openapi
 * /api/v1/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.patch('/:id', asyncHandler(UserController.update));

/**
 * @openapi
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: User deleted successfully (no body)
 *       404:
 *         description: User not found
 */
router.delete('/:id', asyncHandler(UserController.remove));

router.all('/:id', methodNotAllowed);

export default router;
