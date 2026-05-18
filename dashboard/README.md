# Mini Shop — Admin Dashboard

Web admin dashboard for the **Mini Shop** full-stack challenge: a connected system with a mobile storefront, REST API, and this admin panel. Admins manage catalogue, orders, and store performance while customers shop on the mobile app.

## Role in the system

| Layer         | Technology                             | Port (local) |
| ------------- | -------------------------------------- | ------------ |
| Mobile app    | Expo · React Native · TypeScript       | —            |
| Backend API   | Node.js · Fastify · TypeScript         | **5001**     |
| **Dashboard** | React · Vite · TypeScript · Tailwind   | **5000**     |
| Data / Auth   | Supabase (PostgreSQL · Auth · Storage) | —            |

The dashboard talks to the backend at `http://localhost:5001` by default (`VITE_API_BASE_URL`). Configure overrides in a local `dashboard/.env.development` file (gitignored).

## Planned features (task scope)

Aligned with the Mini Shop specification — Part 3, Admin Web Dashboard:

### Pages

- **Login** — Supabase Auth; admin accounts only
- **Dashboard** — KPI cards: orders today, revenue, active products
- **Products** — table with create / edit / toggle active, image upload
- **Orders** — table with status filter, update status, order detail view

### UX & design

- Sidebar navigation; responsive layout (desktop & tablet)
- Loading skeletons and toast notifications on actions
- Professional Tailwind-based UI; consistent spacing and typography

### Bonus (optional)

- Real-time order updates (Supabase Realtime)
- Dark / light theme

## Tech stack

- **React 19** with **TypeScript**
- **Vite** for dev server and builds
- **Tailwind CSS** for styling
- **React Router** for routing
- **React Hook Form** + **Zod** for forms and validation
- Feature-based structure under `src/features` and shared UI under `src/shared`

## Getting started

From the **repository root**:

```bash
bun install
bun dev
```

Or run only the dashboard:

```bash
bun dev:dashboard
```

| URL                          | Description      |
| ---------------------------- | ---------------- |
| http://localhost:5000        | Admin dashboard  |
| http://localhost:5001        | Backend API      |
| http://localhost:5001/health | API health check |

Run the API alongside the dashboard (`bun dev` from root) so authenticated requests succeed.

## Scripts

```bash
bun dev          # Vite dev server (port 5000)
bun build        # Production build
bun preview      # Preview production build
bun test         # Unit tests (Vitest)
bun run typecheck
```

## Project structure

```
dashboard/
├── src/
│   ├── features/     # Domain modules (auth, products, orders, …)
│   ├── shared/       # UI primitives, hooks, services, config
│   └── router/       # Route definitions and layouts
├── index.html
└── vite.config.ts
```

- **`src/features`** — pages, hooks, and services owned by a feature
- **`src/shared`** — reusable components, API client, error handling, utilities
- **`src/router`** — `AppRoutes`, navigation, and layout wiring

## Environment

Local defaults are built into the app (no committed `.env` required):

- API base URL: `http://localhost:5001` (`src/shared/config/api.ts`)
- Dev server port: **5000** (`vite.config.ts`)

To override, create **`dashboard/.env.development`** (gitignored):

```bash
VITE_API_BASE_URL=http://localhost:5001
```

## Quality & tooling

Linting, formatting, and Git hooks are configured at the monorepo root:

```bash
bun lint
bun format:check
bun test
```

## Related documentation

See the root [README](../README.md) for workspace setup and backend configuration.
