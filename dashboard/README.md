# Mini Shop — Admin Dashboard

Web admin for the **Mini Shop** challenge: KPIs, product catalogue management, and order fulfilment. Connects to the Fastify API on **5001** and optionally to Supabase Realtime for live order updates.

Part of a **multi-app repo** with no Docker: dashboard **5000**, API **5001**, mobile via Expo.

---

## System context

| Layer                          | Technology                                   | Local URL                 |
| ------------------------------ | -------------------------------------------- | ------------------------- |
| **Admin dashboard** (this app) | React 19 · Vite 7 · TypeScript · Tailwind v4 | http://localhost:**5000** |
| Backend API                    | Fastify 5 · TypeScript · Bun                 | http://localhost:**5001** |
| Mobile storefront              | Expo · React Native                          | Expo Go / simulator       |
| Data & auth                    | Supabase (PostgreSQL · Auth · Storage)       | Cloud project             |

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

## Features

| Area               | Capability                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Authentication** | First-run admin setup when no admin exists; then email/password login (admin role only) |
| **Dashboard**      | KPI cards: orders today, revenue today, active products                                 |
| **Products**       | Table with search/filter, create / edit, image upload, toggle active, soft delete       |
| **Orders**         | Status filter, paginated table, update status, detail dialog; optional Realtime sync    |
| **Analytics**      | Revenue and orders charts (extra)                                                       |
| **Settings**       | Profile preferences                                                                     |
| **UX**             | Sidebar layout, responsive shell, skeletons, toasts (Sonner), dark/light theme          |

### Implementation status

| Feature                              | Status                      |
| ------------------------------------ | --------------------------- |
| App shell, sidebar, header, theme    | Done                        |
| First admin setup (`/setup`) + login | Done                        |
| Admin-only login gate                | Done                        |
| Protected routes                     | Done                        |
| Dashboard KPIs                       | Done                        |
| Products CRUD + image upload         | Done                        |
| Orders management + status updates   | Done                        |
| Order Realtime (optional env)        | Done when Supabase vars set |

---

## Prerequisites

- [Bun](https://bun.sh) 1.1+
- Backend running on **http://localhost:5001**
- Supabase configured on the backend (migrations + seed)

---

## Quick start

```bash
cd dashboard
bun install
cp .env.example .env.development   # skip if you already have this file
bun dev
```

| URL                          | Service         |
| ---------------------------- | --------------- |
| http://localhost:5000        | Admin dashboard |
| http://localhost:5001        | Backend API     |
| http://localhost:5001/health | Health check    |

From repo root: `bun dev:dashboard` or `bun dev` (dashboard + backend).

### First admin (fresh database)

When no admin exists in `profiles`, open **http://localhost:5000/setup** and create the store owner account. The API only allows this once.

### Test admin login (seeded database)

After `bun --cwd backend run seed`:

| Field    | Value                 |
| -------- | --------------------- |
| Email    | `admin@minishop.test` |
| Password | `Admin12345!`         |

Non-admin accounts are rejected at login.

---

## Environment

**If you already have `dashboard/.env.development`:** you only need `VITE_API_BASE_URL=http://localhost:5001` for local development. No change required if that works.

Copy the template when setting up a new machine:

```bash
cp .env.example .env.development
```

| Variable                 | Default                 | Purpose                                    |
| ------------------------ | ----------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL`      | `http://localhost:5001` | Fastify API base URL                       |
| `VITE_SUPABASE_URL`      | _(empty)_               | Optional — Realtime on Orders page         |
| `VITE_SUPABASE_ANON_KEY` | _(empty)_               | Optional — same anon key as `backend/.env` |

Realtime is **optional**. Without Supabase vars, orders still load and update via the API; the queue simply won’t auto-refresh on database changes.

For production:

```bash
VITE_API_BASE_URL=https://api.your-domain.com bun run build
```

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
│   │   ├── auth/           # Login, setup, session
│   │   ├── dashboard/      # KPI page
│   │   ├── products/       # CRUD + upload
│   │   ├── orders/         # Queue + detail + Realtime
│   │   └── analytics/      # Charts
│   ├── shared/
│   │   ├── components/     # Design system
│   │   ├── config/api.ts   # Endpoints
│   │   └── services/       # apiClient, Realtime
│   └── router/AppRoutes.tsx
└── vite.config.ts            # port 5000
```

---

## API integration

Configured in `src/shared/config/api.ts`:

- **Auth:** `/auth/setup/status`, `/auth/setup`, `/auth/login`, `/auth/me`, `/auth/refresh`
- **Dashboard:** `/dashboard/stats`, overview and chart endpoints
- **Products:** CRUD + `/products/upload-image`
- **Orders:** list, detail, `/orders/:id/status`
- **Categories:** `/categories`

Responses: success `{ success, data }` · errors `{ statusCode, error, message }`.

---

## Design system

- **Font:** Poppins
- **UI:** Tailwind v4, Radix primitives, Lucide icons
- **Logo:** `src/shared/components/atoms/Logo.tsx`

---

## Related docs

- [Root README](../README.md) — monorepo, env matrix, test accounts
- [Backend README](../backend/README.md) — API, Supabase, seed
- [Mobile README](../mobile/README.md) — Expo storefront
