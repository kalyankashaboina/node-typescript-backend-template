# create-node-ts-api

> Production-ready Node.js + TypeScript REST API template with strict layered architecture.
> For developers who want the right structure from day one — without copying boilerplate.

[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-orange)](./CHANGELOG.md)

---

## Why This Template?

Standard Node.js gives you nothing but a runtime. Most tutorials give you a single file with everything mixed together. Neither teaches you how real production APIs are structured.

This template gives you:

- A **layered architecture** where every file has one job
- **TypeScript strict mode** so bugs get caught before runtime
- **Zod validation** so bad input never reaches your business logic
- **Structured logging** (Pino) — human-readable in dev, JSON in production
- **Rate limiting**, **security headers** (Helmet), and **CORS** configured out of the box
- **OpenAPI docs** (Swagger UI) auto-generated from your route comments
- **Consistent error handling** — every error, everywhere, same shape

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/kalyankashaboina/node-typescript-backend-template.git my-api
cd my-api

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Start development server (hot reload)
npm run dev
```

Open your browser:

| URL | What |
|---|---|
| `http://localhost:5000/health` | Health check |
| `http://localhost:5000/api/v1/users` | Users API |
| `http://localhost:5000/api-docs` | Swagger UI — interactive docs |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js >= 18 | LTS, stable, native fetch |
| Language | TypeScript 5 (strict) | Catch bugs before runtime |
| Framework | Express 5 | Battle-tested, huge ecosystem |
| Validation | Zod 3 | Schema + TypeScript type in one declaration |
| Logging | Pino + pino-http | Structured JSON logs, 5x faster than Winston |
| Security | Helmet | Sets 11 security headers automatically |
| Rate Limiting | express-rate-limit | Protects against DoS and brute-force |
| API Docs | swagger-jsdoc + swagger-ui-express | Auto-generated from route comments |
| Linting | ESLint + @typescript-eslint | Catches bugs and enforces style |
| Formatting | Prettier | Zero-debate code style |

---

## Project Structure

Every folder has exactly one responsibility.

```
create-node-ts-api/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.ts              # Zod-validated env vars — crashes on bad config (intentional)
│   │   ├── logger.ts           # Pino logger — pretty in dev, JSON in prod
│   │   └── swagger.ts          # OpenAPI spec + Swagger UI setup
│   │
│   ├── constants/
│   │   ├── app.constants.ts    # Route prefixes, pagination limits, server timeouts
│   │   ├── errorMessages.ts    # All user-facing error strings in one place
│   │   └── httpStatus.ts       # HTTP_STATUS.NOT_FOUND instead of magic number 404
│   │
│   ├── errors/
│   │   └── AppError.ts         # Custom error class — AppError.notFound() / .conflict() / .badRequest()
│   │
│   ├── middlewares/
│   │   ├── requestId.middleware.ts       # Stamps UUID on every request for log tracing
│   │   ├── rateLimiter.middleware.ts     # Global + strict rate limiters
│   │   ├── auth.middleware.ts            # JWT stub — ready to implement
│   │   ├── error.middleware.ts           # Global error handler (registered last)
│   │   └── methodNotAllowed.middleware.ts# Returns 405 for wrong HTTP method, not 404
│   │
│   ├── validations/
│   │   └── user.validation.ts  # Zod schemas — validate + infer TypeScript types in one step
│   │
│   ├── repositories/
│   │   └── user.repository.ts  # Data access only — swap in-memory store for Prisma/Mongoose here
│   │
│   ├── services/
│   │   └── user.service.ts     # Business logic — knows nothing about HTTP (no req/res)
│   │
│   ├── controllers/
│   │   └── user.controller.ts  # Parse request → call service → send response. No business logic.
│   │
│   ├── routes/
│   │   ├── index.ts            # Central registry — one place to register new resource routers
│   │   └── user.routes.ts      # User endpoints + @openapi JSDoc for Swagger
│   │
│   ├── types/
│   │   └── express.d.ts        # Extends Express Request: req.id, req.user
│   │
│   ├── utils/
│   │   ├── asyncHandler.ts     # Wraps async handlers — no try/catch needed in controllers
│   │   └── response.ts         # sendSuccess() / sendNoContent() — consistent response shape
│   │
│   ├── app.ts                  # Express app setup + middleware pipeline (no port binding)
│   └── server.ts               # HTTP server start + graceful shutdown (SIGTERM/SIGINT)
│
├── .env.example                # All env vars documented — copy to .env
├── .eslintrc.js                # ESLint (TypeScript + security + import order)
├── .prettierrc                 # Prettier formatting rules
├── tsconfig.json               # Dev TypeScript config with path aliases
├── tsconfig.build.json         # Production build (excludes test files)
├── Dockerfile                  # Multi-stage build
└── .dockerignore
```

---

## Architecture: The Layered Pattern

Every request flows through exactly these layers in order:

```
HTTP Request
     |
     v
  Router          -> maps URL + method to a handler
     |
     v
  Controller      -> parse + validate input, call service, send response
     |
     v
  Service         -> enforce business rules, throw AppError on violations
     |
     v
  Repository      -> read/write data (database, in-memory, external API)
     |
     v
HTTP Response
```

**The benefit:** each layer can change without touching the others.

- Swap MongoDB for PostgreSQL? Only `src/repositories/` changes.
- Add a CLI command or GraphQL resolver? Call the service layer directly.
- Test business logic? Call service functions directly — no HTTP involved.

---

## Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build |
| `npm run lint` | Check for ESLint errors |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format all source files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run type-check` | TypeScript check without emitting files |
| `npm run clean` | Delete the `dist/` folder |

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `PORT` | `5000` | HTTP server port |
| `LOG_LEVEL` | `info` | `fatal` / `error` / `warn` / `info` / `debug` / `trace` / `silent` |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in milliseconds (1 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per IP per window |

> **Never commit `.env`** — it is in `.gitignore` by default.

**To add a new variable:**
1. Add it to `envSchema` in `src/config/env.ts`
2. Document it in `.env.example`
3. Use it anywhere: `import { env } from '@config/env'`

---

## API Reference

Base URL: `http://localhost:5000`

| Method | Path | Description | Body |
|---|---|---|---|
| `GET` | `/health` | Health check | — |
| `GET` | `/api/v1/users` | List all users | — |
| `POST` | `/api/v1/users` | Create a user | `{ name, email }` |
| `GET` | `/api/v1/users/:id` | Get user by ID | — |
| `PATCH` | `/api/v1/users/:id` | Update a user | `{ name?, email? }` |
| `DELETE` | `/api/v1/users/:id` | Delete a user | — |

**All responses follow the same shape:**

```jsonc
// Success
{ "success": true,  "statusCode": 200, "data": { ... } }
{ "success": true,  "statusCode": 201, "message": "User created successfully.", "data": { ... } }

// Error
{ "success": false, "statusCode": 404, "message": "User not found." }
{ "success": false, "statusCode": 400, "message": "Invalid request data.", "details": { ... } }
```

Full interactive docs at `http://localhost:5000/api-docs`.

---

## Error Handling

Three categories, all handled automatically by `error.middleware.ts`:

| Error | When thrown | HTTP response |
|---|---|---|
| `ZodError` | `schema.parse()` fails in a controller | `400` with field-level `details` |
| `AppError` (operational) | Business rule violated in a service | The error's own `statusCode` |
| Anything else | Unexpected crash / programmer bug | `500` — generic message, stack hidden in prod |

In services, use the factory methods:

```ts
throw AppError.notFound('User not found.')
throw AppError.conflict('A user with this email already exists.')
throw AppError.badRequest('Invalid input.')
throw AppError.unauthorized('Token expired.')
throw AppError.forbidden('Admins only.')
```

---

## Logging

In **development** — pretty-printed, coloured, human-readable:

```
14:32:01 INFO  Server running   -> http://localhost:5000
14:32:05 INFO  GET /api/v1/users 200
14:32:06 WARN  GET /api/v1/users/bad-id 400
```

In **production** — one JSON object per line, ready for any log aggregator:

```json
{"level":30,"time":1710000000000,"msg":"GET /api/v1/users 200","req":{"id":"abc-123"}}
```

Every log line includes the `X-Request-Id` so you can trace a single request across all logs.

---

## Adding a New Resource

Follow this order every time — skipping layers creates tight coupling.

```
1. src/validations/product.validation.ts    <- define valid input with Zod
2. src/repositories/product.repository.ts   <- data access functions only
3. src/services/product.service.ts          <- business rules, throw AppError
4. src/controllers/product.controller.ts    <- parse -> service -> respond
5. src/routes/product.routes.ts             <- wire routes + @openapi comments
6. src/routes/index.ts                      <- router.use(ROUTES.PRODUCTS, productRoutes)
7. src/constants/app.constants.ts           <- add PRODUCTS: '/products' to ROUTES
```

---

## Swapping the Database

The template ships with an in-memory Map. To switch to a real database, only `src/repositories/` changes. Services, controllers, and routes stay identical.

**Example — Prisma:**

```bash
npm install @prisma/client
npx prisma init
```

```ts
// src/repositories/user.repository.ts — replace in-memory functions:

async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

async function create(input: CreateUserInput): Promise<User> {
  return prisma.user.create({ data: input });
}
```

---

## Docker

```bash
# Build
docker build -t my-api .

# Run
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e LOG_LEVEL=info \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  my-api
```

---

## Roadmap

See [CHANGELOG.md](./CHANGELOG.md) for full version history.

**v0.1.1 — coming soon**

The next release will ship an interactive setup wizard:

```bash
npx create-node-ts-api my-api
```

It will ask:
- Do you want Docker support?
- Do you want Husky git hooks?
- Do you want GitHub Actions CI/CD?
- Do you want a Jest test suite?

And generate only what you choose — no dead config files sitting in your repo.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Author

**Kalyan Kashaboina** — [github.com/kalyankashaboina](https://github.com/kalyankashaboina)

---

## License

[MIT](./LICENSE)
