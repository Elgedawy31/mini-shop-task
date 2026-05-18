# Mini Shop

Full-stack mini e-commerce system for the **Mini Shop developer challenge**: mobile storefront, REST API, and admin dashboard — connected through **Supabase**.

| App                        | Stack                                | Port     |
| -------------------------- | ------------------------------------ | -------- |
| [`dashboard/`](dashboard/) | React · Vite · TypeScript · Tailwind | **5000** |
| [`backend/`](backend/)     | Fastify · TypeScript · Bun           | **5001** |
| `mobile/` _(planned)_      | Expo · React Native · TypeScript     | —        |

**No Docker required.** Install [Bun](https://bun.sh) and run services directly on your machine at the ports above.

---

## Quick start

```bash
bun install
bun dev
```

| Service         | URL                          |
| --------------- | ---------------------------- |
| Admin dashboard | http://localhost:5000        |
| Backend API     | http://localhost:5001        |
| Health check    | http://localhost:5001/health |

Run a single app:

```bash
bun dev:dashboard   # port 5000 only
bun dev:backend     # port 5001 only
```

---

## Architecture

- **Mobile** — browse catalogue, cart, checkout, order history; JWT in SecureStore
- **Backend** — Fastify REST API; Zod validation; Supabase for data, auth, storage
- **Dashboard** — admin login, KPIs, product & order management
- **Supabase** — PostgreSQL + RLS, Auth, Storage, Realtime (order status on mobile)

---

## Environment

Local defaults work without committed `.env` files:

| App       | Variable            | Default                 |
| --------- | ------------------- | ----------------------- |
| Backend   | `PORT`              | `5001`                  |
| Backend   | `CORS_ORIGIN`       | `http://localhost:5000` |
| Dashboard | `VITE_API_BASE_URL` | `http://localhost:5001` |

Override via `backend/.env` or `dashboard/.env.development` (see `.env.example` in each app).

---

## Quality

```bash
bun lint
bun format:check
bun test
```

Husky runs lint-staged before commits.

---

## Production build

```bash
bun run build
bun --cwd backend start
bun --cwd dashboard preview   # port 5000
```

Set `VITE_API_BASE_URL` before `bun run build:dashboard` when the API is not on `http://localhost:5001`.

---

## Documentation

- [Dashboard README](dashboard/README.md) — admin UI setup, features, structure
- [Backend README](backend/README.md) — API setup and route contract

---

## Task scope

Implements the Mini Shop specification: Expo mobile app, Fastify API, Supabase data layer, and React admin dashboard with professional UX, security (RLS, JWT, validation), and optional realtime order updates on mobile.
