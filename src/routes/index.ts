/**
 * @file routes/index.ts
 * @description Central route registry — all /api/v1 resource routers live here.
 *
 * WHY A CENTRAL REGISTRY?
 * ────────────────────────
 * Instead of importing every router directly in app.ts (which grows messy),
 * this single file is the one place you register new resource routes.
 *
 * app.ts mounts this entire router at /api/v1.
 * So a route registered as /users here is accessible at /api/v1/users.
 *
 * HOW TO ADD A NEW RESOURCE
 * ──────────────────────────
 * 1. Create src/routes/product.routes.ts
 * 2. Import it here and add: router.use(ROUTES.PRODUCTS, productRoutes)
 * 3. Done — now accessible at /api/v1/products
 *
 * NOTE: The /health endpoint lives in app.ts (top-level, not under /api/v1).
 *
 * @example
 * import productRoutes from './product.routes'
 * router.use(ROUTES.PRODUCTS, productRoutes)
 */

import { Router } from 'express';

import { ROUTES } from '@constants/app.constants';
import userRoutes from './user.routes';
// import productRoutes from './product.routes'  ← add new resources here

const router = Router();

// ── API v1 Resources ──────────────────────────────────────────────────────────
router.use(ROUTES.USERS, userRoutes);
// router.use(ROUTES.PRODUCTS, productRoutes)

export default router;
