# Mini Shop Task

Workspace for the mini shop dashboard and API.

## Apps

- `dashboard/` - Vite, React, TypeScript, Tailwind dashboard (port **5000**).
- `backend/` - Fastify API service (port **5001**).

## Requirements

- Bun 1.1+

## Local Development

```bash
bun install
bun dev
```

| Service   | URL                          |
| --------- | ---------------------------- |
| Dashboard | http://localhost:5000        |
| Backend   | http://localhost:5001        |
| Health    | http://localhost:5001/health |

Run only one app:

```bash
bun dev:dashboard
bun dev:backend
```

### Environment

Defaults are built in for local development (no `.env` files required):

- Backend: `PORT=5001`, `CORS_ORIGIN=http://localhost:5000` — see `backend/src/config/env.ts`.
- Dashboard: `VITE_API_BASE_URL=http://localhost:5001` — see `dashboard/src/shared/config/api.ts`.

To override, create local files (gitignored): `dashboard/.env.development` or export variables in your shell.

## Quality

```bash
bun lint
bun format:check
bun test
```

Husky runs `lint-staged` before commits.

## Production build

```bash
bun run build
bun --cwd backend start
bun --cwd dashboard preview
```

Set `VITE_API_BASE_URL` before `bun run build:dashboard` when the API is not on `http://localhost:5001`.
