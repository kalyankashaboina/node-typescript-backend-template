# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

> Changes staged for the next release go here.

---

## [0.1.1] — coming soon

### Planned

- Interactive setup wizard: `npx create-node-ts-api`
  - Prompts: Do you need Docker? Husky git hooks? GitHub Actions CI/CD? Testing (Jest)?
  - Generates only what you choose — no dead config files
- Jest + supertest test suite (unit + integration)
- Husky pre-commit hooks + lint-staged
- GitHub Actions CI pipeline (type-check → lint → test → build)
- Docker multi-stage build

---

## [0.1.0] — 2025-03-13

### Initial Release

First public release of `create-node-ts-api` — a production-ready
Node.js + TypeScript REST API template with strict layered architecture.

### Added

**Core Architecture**
- Strict layered architecture: Routes → Controllers → Services → Repositories
- TypeScript 5 with `strict: true` and all recommended checks enabled
- Path aliases (`@config/*`, `@services/*`, `@repositories/*`, etc.) for clean imports

**Configuration**
- `src/config/env.ts` — Zod-validated environment variables; app crashes on startup if misconfigured
- `src/config/logger.ts` — Pino structured logging (human-readable in dev, JSON in prod)
- `src/config/swagger.ts` — OpenAPI 3.0 spec with Swagger UI at `/api-docs`

**Security & Middleware**
- Helmet for security headers (11 headers set automatically)
- CORS with configurable allowed origins via `ALLOWED_ORIGINS` env var
- Global + strict rate limiting via `express-rate-limit`
- UUID request ID stamped on every request (`X-Request-Id` header + all log lines)
- Auth middleware stub — ready for JWT implementation
- `methodNotAllowed` middleware returns proper 405 (not 404) for wrong HTTP methods

**Error Handling**
- `AppError` class with factory methods: `notFound`, `conflict`, `badRequest`, `unauthorized`, `forbidden`, `internal`
- Global `errorMiddleware` handles Zod errors → 400, operational AppErrors → their status, unknown crashes → 500
- `asyncHandler` wrapper eliminates try/catch boilerplate in every controller
- Stack traces shown in development, hidden in production

**API**
- Full CRUD for `/api/v1/users` as a working reference implementation
- Consistent response shape: `{ success, statusCode, data, message?, details? }`
- `sendSuccess()` and `sendNoContent()` response helpers
- Health check at `/health` (top-level, not under `/api/v1`)
- Swagger UI at `/api-docs` with all endpoints documented

**Developer Experience**
- `tsx watch` for instant hot-reload in development (`npm run dev`)
- ESLint with TypeScript, import order, and security plugins
- Prettier for consistent code formatting
- `tsconfig.build.json` for production builds (excludes test files)
- Clean ASCII startup logs — works correctly on Windows terminals

### Fixed (from pre-release)
- `/health` returning 404 — route was nested under `/api/v1`; moved to app-level
- Windows terminal encoding — removed emoji from startup logs
- `@types/*` conflict in Jest `moduleNameMapper` — removed (tests ship in v0.1.1)
- `swagger.ts` relative `apis` path — replaced with `path.join(__dirname, ...)` 
- `req.id` typed as optional — changed to required since `requestIdMiddleware` always sets it
- `auth.middleware.ts` `return next()` — fixed for TypeScript strict void return type

---

[Unreleased]: https://github.com/kalyankashaboina/node-typescript-backend-template/compare/v0.1.0...HEAD
[0.1.1]: https://github.com/kalyankashaboina/node-typescript-backend-template/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/kalyankashaboina/node-typescript-backend-template/releases/tag/v0.1.0
