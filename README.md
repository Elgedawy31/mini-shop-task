# Mini Shop Task

Workspace for the mini shop dashboard and API.

## Apps

- `dashboard/` - Vite, React, TypeScript, Tailwind dashboard.
- `backend/` - Fastify API service.

## Requirements

- Bun 1.1+
- Docker and Docker Compose for containerized development

## Local Development

```bash
bun install
bun dev
```

Run only one app:

```bash
bun dev:dashboard
bun dev:backend
```

## Quality

```bash
bun lint
bun format:check
bun test
```

Husky runs `lint-staged` before commits.

## Docker

```bash
docker compose up --build
```

- Dashboard: http://localhost:5000
- Backend: http://localhost:4000
- Health check: http://localhost:4000/health
