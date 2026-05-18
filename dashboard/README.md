# Mini Shop — Admin Dashboard

Professional web admin panel for the **Mini Shop** full-stack challenge. Store operators sign in here to monitor performance, manage the product catalogue, and fulfil customer orders placed from the mobile storefront.

This app is **Part 3** of the Mini Shop task: React admin UI backed by a Fastify REST API and Supabase (PostgreSQL, Auth, Storage).

---

## System context

| Layer                          | Technology                                  | Local URL                      |
| ------------------------------ | ------------------------------------------- | ------------------------------ |
| **Admin dashboard** (this app) | React 19 · Vite · TypeScript · Tailwind CSS | http://localhost:**5000**      |
| Backend API                    | Node.js · Fastify · TypeScript              | http://localhost:**5001**      |
| Mobile app                     | Expo · React Native · TypeScript            | _(separate `/mobile` project)_ |
| Data & auth                    | Supabase (PostgreSQL · Auth · Storage)      | Supabase cloud / local         |

```text
┌─────────────┐     REST (JWT)      ┌─────────────┐     Supabase SDK     ┌──────────┐
│   Mobile    │ ──────────────────► │   Fastify   │ ───────────────────► │ Supabase │
│  (Expo)     │                     │   :5001     │                      │          │
└─────────────┘                     └──────▲──────┘                      └──────────┘
                                           │
┌─────────────┐     REST (JWT)             │
│  Dashboard  │ ───────────────────────────┘
│   :5000     │
└─────────────┘
```

**Local development does not use Docker.** Run the dashboard and API with [Bun](https://bun.sh) on your machine at the ports above.

---

## Features (task scope)

Aligned with the Mini Shop specification — **Admin Web Dashboard**:

| Area               | Capability                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Authentication** | Admin-only login (Supabase Auth via API); session token in secure cookie   |
| **Dashboard**      | KPI cards: orders today, revenue, active products                          |
| **Products**       | Table with create / edit / toggle active; image upload to Supabase Storage |
| **Orders**         | Table with status filter; update status; order detail view                 |
| **UX**             | Sidebar navigation; responsive desktop & tablet; skeletons & toasts        |
| **Theme**          | Dark / light mode (implemented)                                            |
| **Bonus**          | Live order updates via Supabase Realtime _(optional)_                      |

### Implementation status

| Feature                           | Status      |
| --------------------------------- | ----------- |
| App shell, layout, sidebar, theme | Done        |
| Login UI & auth service wiring    | In progress |
| Dashboard KPIs                    | Planned     |
| Products CRUD                     | Planned     |
| Orders management                 | Planned     |
| Protected routes (admin gate)     | Planned     |

---

## Prerequisites

- **Bun** 1.1+ ([install](https://bun.sh))
- Backend API running on **port 5001** (`bun dev:backend` from repo root)
- Supabase project configured on the backend _(when API auth is enabled)_

---

## Quick start

From the **repository root**:

```bash
bun install
bun dev
```

This starts the dashboard on **http://localhost:5000** and the API on **http://localhost:5001**.

Dashboard only:

```bash
bun dev:dashboard
```

| URL                          | Description      |
| ---------------------------- | ---------------- |
| http://localhost:5000        | Admin dashboard  |
| http://localhost:5001        | Backend API      |
| http://localhost:5001/health | API health check |

---

## Environment

Defaults are built in — no `.env` file is required for local development.

| Variable            | Default                 | Purpose              |
| ------------------- | ----------------------- | -------------------- |
| `VITE_API_BASE_URL` | `http://localhost:5001` | Fastify API base URL |

To override, create **`dashboard/.env.development`** (gitignored):

```bash
VITE_API_BASE_URL=http://localhost:5001
```

See [`.env.example`](.env.example) for a template.

---

## Scripts

```bash
bun dev          # Dev server on port 5000 (strict — fails if port is in use)
bun build        # Typecheck + production build
bun preview      # Preview production build on port 5000
bun test         # Vitest unit tests
bun run lint     # ESLint (from monorepo root: bun lint)
```

---

## Project structure

```text
dashboard/
├── src/
│   ├── features/          # Domain modules
│   │   ├── auth/          # Login, hooks, authService
│   │   └── dashboard/     # KPI home
│   ├── shared/
│   │   ├── components/    # Atoms, molecules, organisms, templates
│   │   ├── config/        # API endpoints (api.ts)
│   │   ├── hooks/         # useApi, useTheme, …
│   │   ├── lib/           # apiResponse helpers
│   │   ├── services/      # apiClient, errorHandler
│   │   └── types/         # API contracts
│   └── router/            # AppRoutes, layouts
├── index.html
└── vite.config.ts         # Port 5000, @ alias
```

**Conventions**

- **`src/features`** — pages, hooks, and services owned by a domain
- **`src/shared`** — reusable UI, API client, utilities
- **`src/router`** — route definitions and layout wiring
- Branding uses the in-app **`Logo`** component (Lucide icon + wordmark), not static image assets

---

## API integration

The dashboard calls the backend using paths defined in `src/shared/config/api.ts`:

- **Auth:** `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/me`
- **Products:** CRUD under `/products`
- **Orders:** `/orders`, `/orders/my`, `/orders/:id/status`
- **Stats:** `/dashboard/stats`

Success responses: `{ success: true, data?: T }`.  
Errors: `{ statusCode, error, message }`.

---

## Design system

- **Typography:** Poppins (`src/index.css`)
- **Styling:** Tailwind CSS v4 with semantic tokens (`primary`, `sidebar`, `destructive`, …)
- **Components:** Radix primitives + shared atoms in `src/shared/components`
- **Icons:** [Lucide React](https://lucide.dev) — including the storefront mark in `Logo.tsx`

---

## Quality & tooling

From the monorepo root:

```bash
bun lint
bun format:check
bun test
```

Husky runs lint-staged on commit.

---

## Production build

```bash
# From repo root
VITE_API_BASE_URL=https://api.your-domain.com bun run build:dashboard
bun --cwd dashboard preview   # Serves on port 5000
```

Set `VITE_API_BASE_URL` to your deployed Fastify API before building.

---

## Related documentation

- [Root README](../README.md) — monorepo setup, ports, no-Docker workflow
- [Backend README](../backend/README.md) — API service and Supabase configuration

---

## Task reference

Built for the **Mini Shop** full-stack developer challenge (mobile app · REST API · admin dashboard · Supabase). Evaluation areas: functionality, code quality, UI/UX, security, and optional realtime order updates on mobile.
