# Mini Shop — Admin Dashboard

Professional web admin for the **Mini Shop** full-stack challenge. Store operators sign in here to monitor KPIs, manage the product catalogue, and fulfil orders from the mobile storefront.

Part of a **multi-app Bun repo** with no Docker: dashboard on **port 5000**, API on **port 5001**.

---

## System context

| Layer                          | Technology                                       | Local URL                 |
| ------------------------------ | ------------------------------------------------ | ------------------------- |
| **Admin dashboard** (this app) | React 19 · Vite 7 · TypeScript · Tailwind CSS v4 | http://localhost:**5000** |
| Backend API                    | Fastify 5 · TypeScript · Bun                     | http://localhost:**5001** |
| Mobile app _(planned)_         | Expo · React Native                              | —                         |
| Data & auth                    | Supabase (PostgreSQL · Auth · Storage)           | Cloud project             |

```text
┌─────────────┐     REST + JWT      ┌─────────────┐     Supabase SDK     ┌──────────┐
│   Mobile    │ ──────────────────► │   Fastify   │ ───────────────────► │ Supabase │
│   (Expo)    │                     │   :5001     │                      │          │
└─────────────┘                     └──────▲──────┘                      └──────────┘
                                           │
┌─────────────┐     REST + JWT             │
│  Dashboard  │ ───────────────────────────┘
│   :5000     │
└─────────────┘
```

---

## Features (Mini Shop task — Part 3)

| Area               | Capability                                                                            |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Authentication** | First-run admin setup (Payload-style) when no admins exist; then email/password login |
| **Dashboard**      | KPI cards: orders today, revenue today, active products                               |
| **Products**       | Table with create / edit / toggle active; image upload _(planned)_                    |
| **Orders**         | Status filter, update status, detail view _(planned)_                                 |
| **UX**             | Sidebar layout, responsive shell, skeletons, toasts, dark/light theme                 |
| **Branding**       | Lucide storefront icon via `Logo` component — no static logo image files              |

### Implementation status

| Feature                              | Status  |
| ------------------------------------ | ------- |
| App shell, sidebar, header, theme    | Done    |
| First admin setup (`/setup`) + login | Done    |
| Login UI + auth service + admin gate | Done    |
| Protected routes                     | Done    |
| Dashboard KPIs (`/dashboard/stats`)  | Done    |
| Products CRUD pages                  | Planned |
| Orders management pages              | Planned |

---

## Prerequisites

- [Bun](https://bun.sh) 1.1+
- Backend running on **http://localhost:5001**
- Supabase configured on the backend (migrations + seed)

---

## Quick start

From inside **`dashboard/`**:

```bash
cd dashboard
bun install
bun dev
```

| URL                          | Service         |
| ---------------------------- | --------------- |
| http://localhost:5000        | Admin dashboard |
| http://localhost:5001        | Backend API     |
| http://localhost:5001/health | Health check    |

From the repo root, you can still start the dashboard with:

```bash
bun dev:dashboard
```

### First admin (fresh database)

When no admin exists in `profiles`, open **http://localhost:5000/setup** and create the store owner account (name, email, password). The API only allows this once; afterward everyone signs in at `/sign-in`.

### Test admin login (seeded database)

After `bun --cwd backend run seed`, setup is skipped and you sign in directly:

| Field    | Value                 |
| -------- | --------------------- |
| Email    | `admin@minishop.test` |
| Password | `Admin12345!`         |

---

## Environment

| Variable            | Default                 | Purpose              |
| ------------------- | ----------------------- | -------------------- |
| `VITE_API_BASE_URL` | `http://localhost:5001` | Fastify API base URL |

Create **`dashboard/.env.development`** to override:

```bash
VITE_API_BASE_URL=http://localhost:5001
```

Template: [`.env.example`](.env.example).

---

## Scripts

```bash
bun dev          # Vite dev server — port 5000 (strictPort)
bun build        # Typecheck + production build
bun preview      # Preview build on port 5000
```

From repo root: `bun lint`, `bun run build`.

---

## Project structure

```text
dashboard/
├── src/
│   ├── features/
│   │   ├── auth/           # Login, hooks, authService
│   │   └── dashboard/      # KPI page, stats service
│   ├── shared/
│   │   ├── components/     # Design system (atoms → templates)
│   │   ├── config/api.ts   # Endpoints aligned with backend
│   │   └── services/       # apiClient, errorHandler
│   └── router/AppRoutes.tsx
├── index.html              # Inline SVG favicon (no logo.png)
└── vite.config.ts          # port 5000, strictPort
```

---

## API integration

Configured in `src/shared/config/api.ts`:

- **Auth:** `/auth/setup/status`, `/auth/setup`, `/auth/login`, `/auth/me`
- **Dashboard:** `/dashboard/stats`
- **Products / orders:** wired when pages are added

Responses: success `{ success, data }` · errors `{ statusCode, error, message }`.

---

## Design system

- **Font:** Poppins
- **UI:** Tailwind v4 semantic tokens, Radix primitives, Lucide icons
- **Logo:** `src/shared/components/atoms/Logo.tsx` (icon + wordmark)

---

## Production build

```bash
VITE_API_BASE_URL=https://api.your-domain.com bun run build:dashboard
bun --cwd dashboard preview
```

---

## Related docs

- [Root README](../README.md) — monorepo, ports, no-Docker workflow
- [Backend README](../backend/README.md) — API, Supabase, seed data

---

Built for the **Mini Shop** developer challenge: mobile storefront, REST API, admin dashboard, Supabase.
