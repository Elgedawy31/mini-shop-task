# Supabase — Mini Shop Backend

Database migrations for project **`sejiiywghkekfvcdqkec`**.  
All CLI commands run from the **`backend/`** directory (where this `supabase/` folder lives).

## Prerequisites

1. [Supabase CLI](https://supabase.com/docs/guides/cli) — or `bunx supabase` from `backend/`.
2. Log in once:

```bash
cd backend
bunx supabase login
```

3. Database password from **Dashboard → Project Settings → Database** (same as `DB_PASSWORD` in `backend/.env`).

---

## One-time: link project

```bash
cd backend
bun run db:link
```

Or:

```bash
cd backend
bunx supabase link --project-ref sejiiywghkekfvcdqkec
```

Link metadata is stored in `backend/supabase/.temp/` (gitignored).

---

## Apply migrations

```bash
cd backend
bun run db:push
```

Migrations (in order):

| File                                             | Purpose                     |
| ------------------------------------------------ | --------------------------- |
| `migrations/20260518120000_initial.sql`          | Tables, RLS, order RPC      |
| `migrations/20260518120001_storage_realtime.sql` | Storage policies + Realtime |

---

## New migration

```bash
cd backend
bun run db:migration -- my_change_name
# edit supabase/migrations/<timestamp>_my_change_name.sql
bun run db:push
```

---

## Seed data

```bash
cd backend
bun run seed
```

---

## Scripts (backend/package.json)

| Script                 | Command               |
| ---------------------- | --------------------- |
| `bun run db:link`      | Link remote project   |
| `bun run db:push`      | Push migrations       |
| `bun run db:migration` | Create new migration  |
| `bun run db:status`    | List migration status |
| `bun run seed`         | Seed users + products |

From repo root:

```bash
bun --cwd backend run db:push
bun --cwd backend run seed
```

---

## Storage

Create bucket **`product-images`** (public) in Dashboard → Storage before image uploads.

---

## Troubleshooting

| Issue                       | Fix                                             |
| --------------------------- | ----------------------------------------------- |
| `Access token not provided` | `bunx supabase login`                           |
| CLI can't find config       | Run commands from **`backend/`**, not repo root |
| Upload fails                | Bucket `product-images` must exist              |
