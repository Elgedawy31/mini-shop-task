# Mini Shop — Backend API

REST API for the **Mini Shop** challenge: **Fastify 5**, **TypeScript**, **Supabase** (PostgreSQL, Auth, Storage), **Zod** validation.

| Setting | Value                                 |
| ------- | ------------------------------------- |
| Port    | **5001**                              |
| CORS    | http://localhost:5000                 |
| Runtime | [Bun](https://bun.sh) — **no Docker** |

---

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) (ref: `sejiiywghkekfvcdqkec`).
2. Apply migrations via CLI (see [`supabase/README.md`](supabase/README.md)):

   ```bash
   cd backend
   bunx supabase login
   bun run db:link      # enter DB password when prompted
   bun run db:push
   ```

3. **Auth → Providers → Email**: disable “Confirm email” for local dev (or handle confirmation in the app).
4. **Storage**: create a public bucket named `product-images` (or set `STORAGE_BUCKET` in `.env`).
5. **Database → Replication**: add `orders` to the `supabase_realtime` publication (for mobile live updates).

### 2. Environment

```bash
cp .env.example .env
```

Fill in from **Project Settings → API**:

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Install & run

```bash
# From repo root
bun install
bun dev:backend
```

Health: http://localhost:5001/health

### 4. Seed data

```bash
bun run seed
```

| Account  | Email                  | Password     | Role     |
| -------- | ---------------------- | ------------ | -------- |
| Customer | customer@minishop.test | Customer123! | customer |
| Admin    | admin@minishop.test    | Admin12345!  | admin    |

Also seeds **3 categories** and **11 products**.

---

## API routes

### Auth

| Method | Route                   | Access                                           |
| ------ | ----------------------- | ------------------------------------------------ |
| POST   | `/auth/register`        | Public                                           |
| POST   | `/auth/login`           | Public                                           |
| POST   | `/auth/forgot-password` | Public                                           |
| GET    | `/auth/setup/status`    | Public — `{ needsSetup }` when no admin exists   |
| POST   | `/auth/setup`           | Public — create first admin (only if none exist) |
| GET    | `/auth/me`              | Bearer JWT                                       |
| PATCH  | `/auth/me`              | Bearer JWT                                       |

### Products

| Method | Route                    | Access                                     |
| ------ | ------------------------ | ------------------------------------------ |
| GET    | `/products`              | Public (`?search=&category=&page=&limit=`) |
| GET    | `/products/:id`          | Public                                     |
| POST   | `/products`              | Admin                                      |
| POST   | `/products/upload-image` | Admin (multipart)                          |
| PATCH  | `/products/:id`          | Admin                                      |
| DELETE | `/products/:id`          | Admin (soft delete)                        |

### Orders

| Method | Route                | Access        |
| ------ | -------------------- | ------------- |
| POST   | `/orders`            | Authenticated |
| GET    | `/orders/my`         | Authenticated |
| GET    | `/orders`            | Admin         |
| PATCH  | `/orders/:id/status` | Admin         |

### Dashboard

| Method | Route              | Access |
| ------ | ------------------ | ------ |
| GET    | `/dashboard/stats` | Admin  |

**Responses**

- Success: `{ "success": true, "data": … }`
- Error: `{ "statusCode", "error", "message" }`

---

## Project structure

```text
backend/
├── src/                # Fastify API
├── supabase/           # Migrations, config.toml (CLI)
│   └── migrations/
├── scripts/            # seed.ts
└── .env                # Supabase keys (gitignored)
```

---

## Scripts

```bash
bun dev            # Watch on :5001
bun build          # Compile to dist/
bun start          # Run dist/server.js
bun run seed       # Seed categories, products, test users
bun run db:link    # Link Supabase project (run from backend/)
bun run db:push    # Apply migrations
bun run db:migration -- name
bun test
bun run typecheck
```

---

## Security

- Row Level Security on all tables (see migration).
- JWT verified via Supabase Auth; `profiles.role` for admin vs customer.
- Service role key only used server-side (seed, profile bootstrap).
- Order totals computed in Postgres (`create_order_with_items` RPC).
- Product images: type/size validated; stored in Supabase Storage.

---

## Realtime (mobile bonus)

After admin updates order status, mobile clients subscribe to Postgres changes:

```typescript
supabase
  .channel("orders")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
    handler
  )
  .subscribe();
```

---

## Related docs

- [Supabase migrations](supabase/README.md)
- [Root README](../README.md)
- [Dashboard README](../dashboard/README.md)
