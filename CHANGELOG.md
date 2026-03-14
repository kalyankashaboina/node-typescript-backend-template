# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

> Changes staged for the next release go here.

---

## [0.2.0] — 2025-03-14

### Added
- Interactive setup wizard via `npx create-node-ts-api my-api`
  - Prompts: Docker, Husky + lint-staged, Prettier, GitHub Actions CI/CD, Testing
  - Testing framework choice: Jest (ts-jest) or Vitest
  - Generates only selected config — no unused files
- Conditional scaffolding — Docker, Husky, Prettier, CI/CD, Jest, Vitest
- `docker-compose.yml` generated when Docker is selected
- `.husky/pre-commit` hook + lint-staged config generated when Husky is selected
- GitHub Actions CI workflow generated when CI/CD is selected — includes test step if testing enabled
- `jest.config.js` + example test generated when Jest is selected
- `vitest.config.ts` + example test generated when Vitest is selected
- Full Windows terminal support — ASCII fallbacks for all symbols
- Git initialized automatically with initial commit on scaffold

### Changed
- Logger updated — human-readable in dev, JSON in prod (Pino)
- npm package metadata and promoting section cleaned up
- Prettier is now opt-in via prompt instead of always included

### Fixed
- Windows terminal encoding — removed emoji from startup logs
- Interactive prompt flow stability improvements
- `.gitignore` rename fix — npm strips dotfiles on publish, renamed back on scaffold

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
- `src/config/env.ts` — Zod-validated environment variables
- `src/config/logger.ts` — Pino structured logging
- `src/config/swagger.ts` — OpenAPI 3.0 spec with Swagger UI at `/api-docs`

**Security & Middleware**
- Helmet for security headers
- CORS with configurable `ALLOWED_ORIGINS`
- Global rate limiting via `express-rate-limit`
- UUID request ID on every request (`X-Request-Id` header)
- Auth middleware stub — ready for JWT
- `methodNotAllowed` middleware returns 405 (not 404)

**Error Handling**
- `AppError` class with factory methods: `notFound`, `conflict`, `badRequest`, `unauthorized`, `forbidden`, `internal`
- Global `errorMiddleware` — Zod errors → 400, AppErrors → their status, crashes → 500
- `asyncHandler` — eliminates try/catch boilerplate in controllers

**API**
- Full CRUD `/api/v1/users` as reference implementation
- Consistent response shape: `{ success, statusCode, data, message?, details? }`
- `sendSuccess()` and `sendNoContent()` helpers
- Health check at `/health`
- Swagger UI at `/api-docs`

### Fixed
- `/health` returning 404 — moved to app-level
- `@types/*` conflict in Jest `moduleNameMapper`
- `swagger.ts` relative path — replaced with `path.join(__dirname, ...)`
- `req.id` typed as optional — changed to required
- `auth.middleware.ts` strict void return type fix

---

[Unreleased]: https://github.com/kalyankashaboina/node-typescript-backend-template/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/kalyankashaboina/node-typescript-backend-template/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/kalyankashaboina/node-typescript-backend-template/releases/tag/v0.1.0