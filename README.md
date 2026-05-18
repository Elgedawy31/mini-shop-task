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

Development, with hot reload and bind mounts:

```bash
docker compose up --build
# or
docker compose -f docker-compose.dev.yml up --build
```

- Dashboard: http://localhost:5000
- Backend: http://localhost:5001
- Health check: http://localhost:5001/health

Production-style local run:

```bash
docker compose -f docker-compose.prod.yml up --build
```

- Dashboard: http://localhost:8080
- Backend: http://localhost:5001
- Health check: http://localhost:5001/health

Override ports or origins with environment variables:

```bash
DASHBOARD_PORT=8081 BACKEND_PORT=5002 VITE_API_BASE_URL=http://localhost:5002 CORS_ORIGIN=http://localhost:8081 docker compose -f docker-compose.prod.yml up --build
```

For local development without Docker, set `PORT=5001`, `CORS_ORIGIN=http://localhost:5000`, and `VITE_API_BASE_URL=http://localhost:5001` in your environment.
