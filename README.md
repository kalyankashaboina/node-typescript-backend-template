# create-node-ts-api

> Production-ready Node.js + TypeScript REST API template with strict layered architecture.
> Scaffold a new project in seconds — no config, no boilerplate hunting.

[![npm](https://img.shields.io/npm/v/create-node-ts-api)](https://www.npmjs.com/package/create-node-ts-api)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Usage

```bash
npx create-node-ts-api my-api
cd my-api
npm run dev
```

That's it. Your API is running.

| URL | What |
|---|---|
| `http://localhost:5000/health` | Health check |
| `http://localhost:5000/api/v1/users` | Users API |
| `http://localhost:5000/api-docs` | Swagger UI — interactive docs |

---

## What you get

A fully working REST API with:

- **Layered architecture** — Routes → Controllers → Services → Repositories. Every file has one job.
- **TypeScript 5 strict mode** — bugs caught before runtime, path aliases configured
- **Zod validation** — schema + TypeScript type in one declaration, bad input never reaches business logic
- **Pino logging** — human-readable in dev, JSON in production
- **Security out of the box** — Helmet (11 headers), CORS, rate limiting
- **Swagger UI** — auto-generated from your route comments at `/api-docs`
- **AppError** — consistent error handling with factory methods (`notFound`, `conflict`, `badRequest`...)
- **asyncHandler** — no try/catch in controllers, ever
- **Docker** — multi-stage production build included

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 18 |
| Language | TypeScript 5 (strict) |
| Framework | Express 5 |
| Validation | Zod 3 |
| Logging | Pino + pino-http |
| Security | Helmet + express-rate-limit + CORS |
| API Docs | swagger-jsdoc + swagger-ui-express |
| Linting | ESLint + @typescript-eslint |
| Formatting | Prettier |

---

## Project Structure

```
my-api/
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod-validated env vars — crashes on bad config
│   │   ├── logger.ts           # Pino logger (pretty dev / JSON prod)
│   │   └── swagger.ts          # OpenAPI spec + Swagger UI
│   ├── constants/
│   │   ├── app.constants.ts    # Route prefixes, timeouts
│   │   ├── errorMessages.ts    # All error strings in one place
│   │   └── httpStatus.ts       # HTTP_STATUS.NOT_FOUND not magic 404
│   ├── errors/
│   │   └── AppError.ts         # AppError.notFound() / .conflict() / .badRequest()
│   ├── middlewares/
│   │   ├── requestId.middleware.ts        # UUID on every request for tracing
│   │   ├── rateLimiter.middleware.ts      # Global + strict limiters
│   │   ├── auth.middleware.ts             # JWT stub — ready to implement
│   │   ├── error.middleware.ts            # Global error handler
│   │   └── methodNotAllowed.middleware.ts # 405 not 404 for wrong method
│   ├── validations/
│   │   └── user.validation.ts  # Zod schemas + inferred types
│   ├── repositories/
│   │   └── user.repository.ts  # Data access only — swap DB here
│   ├── services/
│   │   └── user.service.ts     # Business logic, no HTTP knowledge
│   ├── controllers/
│   │   └── user.controller.ts  # Parse → service → respond
│   ├── routes/
│   │   ├── index.ts            # Central route registry
│   │   └── user.routes.ts      # User endpoints + Swagger docs
│   ├── types/
│   │   └── express.d.ts        # req.id, req.user type extensions
│   ├── utils/
│   │   ├── asyncHandler.ts     # Eliminates try/catch in controllers
│   │   └── response.ts         # sendSuccess() / sendNoContent()
│   ├── app.ts                  # Express setup (no port binding)
│   └── server.ts               # Start server + graceful shutdown
├── .env.example
├── tsconfig.json
├── tsconfig.build.json
├── Dockerfile
└── package.json
```

---

## Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the production build |
| `npm run lint` | Check ESLint errors |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format with Prettier |
| `npm run type-check` | TypeScript check, no emit |
| `npm run clean` | Delete `dist/` |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `PORT` | `5000` | Server port |
| `LOG_LEVEL` | `info` | `fatal` / `error` / `warn` / `info` / `debug` / `trace` |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per IP per window |

---

## Architecture

```
HTTP Request
     |
     v
  Router       -> maps URL + method to handler
     |
     v
  Controller   -> validate input, call service, send response
     |
     v
  Service      -> business rules, throw AppError on violations
     |
     v
  Repository   -> read/write data (swap DB here, nothing else changes)
     |
     v
HTTP Response
```

---

## Adding a New Resource

```
1. src/validations/product.validation.ts    <- Zod schemas
2. src/repositories/product.repository.ts   <- data access only
3. src/services/product.service.ts          <- business logic
4. src/controllers/product.controller.ts    <- parse -> service -> respond
5. src/routes/product.routes.ts             <- routes + @openapi comments
6. src/routes/index.ts                      <- register the router
7. src/constants/app.constants.ts           <- add route constant
```

---

## Swapping the Database

Only `src/repositories/` changes. Everything else stays identical.

```ts
// Before (in-memory)
async function findById(id: string): Promise<User | null> {
  return store.get(id) ?? null;
}

// After (Prisma)
async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}
```

---

## Docker

```bash
docker build -t my-api .

docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  my-api
```

---

## Roadmap

**v0.1.1 — coming soon**

```bash
npx create-node-ts-api my-api
```

Will ask interactively:
- Add Docker support?
- Add Husky git hooks?
- Add GitHub Actions CI/CD?
- Add Jest test suite?

Generates only what you choose.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Author

**Kalyan Kashaboina** — [github.com/kalyankashaboina](https://github.com/kalyankashaboina)

---

## License

[MIT](./LICENSE)
