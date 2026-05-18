# Supabase — Mini Shop

Database migrations and CLI workflow for project **`sejiiywghkekfvcdqkec`**.

## Prerequisites

1. [Supabase CLI](https://supabase.com/docs/guides/cli) (or use `bunx supabase` from repo root).
2. Log in once (stores access token locally):

```bash
bunx supabase login
```

3. Database password from **Dashboard → Project Settings → Database** (same as `DB_PASSWORD` in `backend/.env`).

---

## One-time: link project

```bash
# From repo root — use your DB password when prompted, or:
bun run db:link
```

Equivalent:

```bash
bunx supabase link --project-ref sejiiywghkekfvcdqkec
```

This writes link metadata under `supabase/.temp/` (gitignored).

---

## Apply migrations to remote DB

```bash
bun run db:push
```

Equivalent:

```bash
bunx supabase db push
```

Applies all files in `supabase/migrations/` in order:

| Migration                             | Purpose                                 |
| ------------------------------------- | --------------------------------------- |
| `20260518120000_initial.sql`          | Tables, RLS, order RPC                  |
| `20260518120001_storage_realtime.sql` | Storage policies + Realtime on `orders` |

---

## Create a new migration

```bash
bun run db:migration -- add_feature_name
```

Equivalent:

```bash
bunx supabase migration new add_feature_name
```

Edit the new file under `supabase/migrations/`, then:

```bash
bun run db:push
```

---

## Seed data (app users + products)

After `db:push`:

```bash
bun --cwd backend seed
```

---

## Check migration status

```bash
bun run db:status
```

---

## Storage bucket

Create **`product-images`** (public) in **Dashboard → Storage** before uploads work.  
Policies are applied by `20260518120001_storage_realtime.sql`.

---

## Troubleshooting

| Issue                       | Fix                                                   |
| --------------------------- | ----------------------------------------------------- |
| `Access token not provided` | Run `bunx supabase login`                             |
| `relation already exists`   | Migration already applied; use `db:status`            |
| Upload fails                | Confirm bucket `product-images` exists                |
| `supabase_realtime` error   | Enable Realtime in Dashboard, re-run second migration |
