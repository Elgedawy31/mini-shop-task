# Mini Shop

Full-stack mini e-commerce system for the **Mini Shop developer challenge**: Expo mobile storefront, Fastify REST API, and React admin dashboard — connected through **Supabase**.

| App                        | Stack                                | Local URL / port          |
| -------------------------- | ------------------------------------ | ------------------------- |
| [`mobile/`](mobile/)       | Expo · React Native · TypeScript     | Expo dev server (Metro)   |
| [`dashboard/`](dashboard/) | React · Vite · TypeScript · Tailwind | http://localhost:**5000** |
| [`backend/`](backend/)     | Fastify · TypeScript · Bun           | http://localhost:**5001** |

**No Docker required.** Install [Bun](https://bun.sh) for the API and dashboard; use **npm** (or bun) inside `mobile/` for Expo.

Each app installs its own dependencies. The repo root only runs shared scripts (`bun dev`, lint, format).

---

## Quick start

### 1. Backend + database

```bash
cd backend
bun install
cp .env.example .env   # if you do not already have .env — see Environment below
bun run db:push        # after supabase link (first time)
bun run seed
bun dev
```

Health: http://localhost:5001/health

### 2. Admin dashboard

```bash
cd dashboard
bun install
cp .env.example .env.development   # optional if defaults work
bun dev
```

Open http://localhost:5000 — sign in as admin (see [Test accounts](#test-accounts)).

### 3. Mobile app

```bash
cd mobile
npm install
cp .env.example .env   # optional — see mobile/README.md
npm start
```

Scan the QR code with **Expo Go** (same Wi‑Fi as your machine). The app talks to the API on port **5001**.

### Run API + dashboard together (from repo root)

```bash
bun dev                 # dashboard :5000 + backend :5001
bun dev:dashboard       # dashboard only
bun dev:backend         # backend only
```

---

## Test accounts

After `bun --cwd backend run seed`:

| Role              | Email                    | Password       |
| ----------------- | ------------------------ | -------------- |
| Customer (mobile) | `customer@minishop.test` | `Customer123!` |
| Admin (dashboard) | `admin@minishop.test`    | `Admin12345!`  |

Seed also creates **3 categories** and **11 products**.

---

## Architecture

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

- **Mobile** — catalogue, cart, checkout, orders, profile; JWT in Expo SecureStore
- **Backend** — REST API, Zod validation, role checks, Supabase Auth + Postgres + Storage
- **Dashboard** — KPIs, products CRUD, order fulfilment, optional Realtime on orders
- **Supabase** — PostgreSQL + RLS, Auth, Storage, Realtime

---

## Environment

**Never commit `.env` files.** Each app has a committed `.env.example` (or template in README). If you already have working `.env` files locally, keep them — you only need to ensure the variables below are set.

### Backend — `backend/.env` (required)

Copy from [`backend/.env.example`](backend/.env.example) if missing.

| Variable                    | Purpose                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `SUPABASE_URL`              | Project URL (Settings → API)                                                                                             |
| `SUPABASE_ANON_KEY`         | Anon public key                                                                                                          |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only; seed script)                                                                              |
| `CORS_ORIGIN`               | Comma-separated origins (dashboard + Expo). Add your LAN IP origins for physical devices, e.g. `http://192.168.1.x:8081` |
| `STORAGE_BUCKET`            | Usually `product-images`                                                                                                 |
| `PORT`                      | Default `5001`                                                                                                           |

The API **will not start** without valid Supabase keys.

### Dashboard — `dashboard/.env.development` (optional)

| Variable                 | Default                 | Purpose                                      |
| ------------------------ | ----------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL`      | `http://localhost:5001` | Fastify API                                  |
| `VITE_SUPABASE_URL`      | _(empty)_               | Optional — live order updates on Orders page |
| `VITE_SUPABASE_ANON_KEY` | _(empty)_               | Optional — same as backend anon key          |

If you already use `dashboard/.env.development` with only `VITE_API_BASE_URL`, that is enough for normal use.

### Mobile — `mobile/.env` (optional)

| Variable                   | Purpose                                                                |
| -------------------------- | ---------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | Override API URL, e.g. `http://192.168.1.71:5001` on a physical device |

If unset, the app infers the host from the Expo dev server in `__DEV__`. Set this explicitly when auto-detection fails (USB-only, different subnet).

**Physical device checklist**

1. Phone and PC on the same Wi‑Fi
2. Backend running with `HOST=0.0.0.0` (default)
3. `EXPO_PUBLIC_API_BASE_URL=http://<your-pc-lan-ip>:5001` in `mobile/.env`
4. Add Expo / device origins to `backend/.env` → `CORS_ORIGIN` if the browser or Expo web hits CORS errors

---

## Demo video (submission)

Record a **4–5 minute MP4** in English covering:

1. Mobile: register or sign in → browse → cart → place order
2. Dashboard: find the order → set status to **Processing**
3. Brief code walkthrough and one technical decision you are proud of

Upload to Google Drive, Loom, or WeTransfer and add the link here:

**Demo video:** _(add your link before submission)_

---

## Quality

```bash
bun lint
bun format:check
```

---

## Production build

```bash
bun run build
bun --cwd backend start
bun --cwd dashboard preview
```

Set `VITE_API_BASE_URL` before building the dashboard when the API is not on `http://localhost:5001`.

---

## Database (Supabase CLI)

From **`backend/`**:

```bash
cd backend
bunx supabase login
bun run db:link
bun run db:push
bun run seed
```

See [backend/supabase/README.md](backend/supabase/README.md).

---

## Documentation

| Doc                                           | Description                |
| --------------------------------------------- | -------------------------- |
| [Mobile README](mobile/README.md)             | Expo setup, env, features  |
| [Backend README](backend/README.md)           | API routes, security, seed |
| [Dashboard README](dashboard/README.md)       | Admin UI, login, pages     |
| [Supabase README](backend/supabase/README.md) | Migrations and CLI         |

---

## Task scope

Implements the Mini Shop specification: Expo mobile app, Fastify API, Supabase (PostgreSQL, Auth, Storage, RLS), and React admin dashboard with polished UX, validation, and role-based access.
