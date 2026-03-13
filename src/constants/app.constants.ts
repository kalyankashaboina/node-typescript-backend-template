/**
 * @file app.constants.ts
 * @description Application-wide constants — routes, pagination, timeouts.
 *
 * WHY CONSTANTS FILES?
 * ────────────────────
 * Hardcoded strings/numbers scattered across files are a maintenance nightmare.
 * Change '/api/v1' in one place here and it updates everywhere automatically.
 */

// Route prefixes
export const ROUTES = {
  API_PREFIX: '/api/v1',
  HEALTH: '/health',
  USERS: '/users',
  // PRODUCTS: '/products',  ← Add new resources here
} as const;

// Default pagination — used in list endpoints
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Server behaviour
export const SERVER = {
  /** How long (ms) to wait for in-flight requests before force-closing */
  SHUTDOWN_TIMEOUT_MS: 10_000,
} as const;
