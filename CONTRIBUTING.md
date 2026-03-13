# Contributing to create-node-ts-api

Thank you for taking the time to contribute!

---

## Getting Started

```bash
git clone https://github.com/kalyankashaboina/node-typescript-backend-template.git
cd node-typescript-backend-template

npm install
cp .env.example .env
npm run dev
```

---

## Development Workflow

### Branching

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/short-description` | `feat/add-product-routes` |
| Bug fix | `fix/short-description` | `fix/health-route-404` |
| Docs | `docs/short-description` | `docs/update-readme` |
| Refactor | `refactor/short-description` | `refactor/user-service` |

Always branch off `main`. One concern per PR.

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`

```bash
git commit -m "feat: add product routes with full CRUD"
git commit -m "fix: health route returning 404"
git commit -m "docs: add database swapping guide to README"
```

---

## Architecture Rules

| Layer | Responsibility | Must NOT |
|---|---|---|
| Routes | Wire URL + method to handlers | Contain any logic |
| Controllers | Parse input, call service, send response | Talk to the database |
| Services | Business logic, enforce rules | Import `req` or `res` |
| Repositories | Data access only | Contain business logic |

### Adding a New Resource

```
1. src/validations/product.validation.ts   <- Zod schemas + inferred types
2. src/repositories/product.repository.ts  <- data access (findAll, create, etc.)
3. src/services/product.service.ts         <- business rules, throw AppError
4. src/controllers/product.controller.ts   <- parse -> service -> respond
5. src/routes/product.routes.ts            <- wire routes + @openapi comments
6. src/routes/index.ts                     <- router.use(ROUTES.PRODUCTS, productRoutes)
7. src/constants/app.constants.ts          <- add PRODUCTS: '/products' to ROUTES
```

---

## Code Standards

- `strict: true` is non-negotiable — never disable strict TypeScript checks
- No `any` types without a comment explaining why
- All user-facing strings go in `src/constants/errorMessages.ts`
- All HTTP status codes use `HTTP_STATUS.*` from `src/constants/httpStatus.ts`

---

## Before Submitting a PR

```bash
npm run type-check    # No TypeScript errors
npm run lint          # No ESLint errors
npm run format:check  # Code is formatted
npm run build         # Production build succeeds
```

---

## Reporting Bugs

Open a GitHub Issue with:
1. Node.js version (`node --version`)
2. Steps to reproduce
3. Expected vs actual behaviour

---

## Questions?

Open a GitHub Discussion or reach out to [@kalyankashaboina](https://github.com/kalyankashaboina).
