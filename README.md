# Soccer Pay

Football salaries across the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Süper Lig, MLS, and the Saudi Pro League.

## Setup

1. Run in Supabase SQL editor (in order):
   - [`schema.sql`](./schema.sql)
   - [`scripts/seed-clubs.sql`](./scripts/seed-clubs.sql) — all 20 PL clubs
   - [`scripts/seed.sql`](./scripts/seed.sql) — sample Arsenal/Chelsea players (optional)
   - [`scripts/seed-season-stats.sql`](./scripts/seed-season-stats.sql) — if stats missing
2. Or: `npm run db:apply` with `SUPABASE_DB_URL` in `.env.local`
3. For extra leagues, run [`scripts/migrate-leagues.sql`](./scripts/migrate-leagues.sql) in the SQL editor (or `npm run db:leagues` once `SUPABASE_DB_URL` is a real URI). For contract breakdown text on player pages, also run [`scripts/add-wage-notes.sql`](./scripts/add-wage-notes.sql) (`npm run db:wage-notes`), then:
   ```bash
   npm run import:clubs -- data/clubs.csv
   npm run import:clubs -- data/clubs-international.csv
   ```
4. Copy [`.env.local.example`](./.env.local.example) → `.env.local` (URL + **anon** key for the app)
5. `npm run check:env` → `npm run dev`

## Deploy (Vercel)

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. **Environment variables** (Production + Preview):

   | Variable | Required | Notes |
   |----------|----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon public key (`eyJ…`) |
   | `NEXT_PUBLIC_SITE_URL` | Yes | e.g. `https://your-domain.com` — used for sitemap, Open Graph, JSON-LD |

   Do **not** add `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DB_URL` to Vercel unless you run imports in CI. Keep those local only.

3. **Build:** `npm run build` pre-renders player/club pages via `generateStaticParams`, so Supabase must be reachable at **build time** with the env vars above.
4. After deploy: open `/`, `/sitemap.xml`, and one `/players/[slug]` URL. Set Supabase **RLS** read policies (see `schema.sql`) so the anon key can read public tables.
5. Optional: connect your domain and set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL, then redeploy.

## Bulk data (recommended)

1. **Clubs** (already in `seed-clubs.sql`, or CSV):
   ```bash
   npm run import:clubs
   ```
2. **Players** — batch files in `data/`:
   ```bash
   npm run import:players -- data/players-batch-1.csv
   npm run import:players -- data/players-batch-2.csv
   ```
   Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (server/scripts only).

3. **Source quality** — before publishing, run:
   ```bash
   npm run validate:sources -- data/players-batch-1.csv
   ```
   Replace homepage `source_url` values with **article-level** links.

Import behavior:

- **Players** upsert on `slug`
- **Contracts** update when `player_id` + `reviewed_at` match, else insert (keeps history)
- **Season stats** upsert on `(player_id, season)`; `annual_wage_gbp` defaults to `weekly × 52` if omitted

## Routes

| Path | Description |
|------|-------------|
| `/` | Sortable/searchable salary table (`?sort=annual&dir=desc&q=`) |
| `/expiring` | Contracts ending within 12 months |
| `/players/[slug]` | Profile, sources, stats, wage metrics |
| `/clubs`, `/clubs/[slug]` | Wage bills |
| `/compare?a=&b=` | Side-by-side |
| `/articles/[slug]` | SEO |

Pin [`schema.sql`](./schema.sql) in Cursor (`@schema.sql`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run setup` | Create `.env.local` from example |
| `npm run check:env` | Validate env (no secrets printed) |
| `npm run db:apply` | schema + clubs + sample seed via Postgres URI |
| `npm run import:clubs` | Upsert clubs from CSV |
| `npm run import:players -- file.csv` | Upsert players/contracts/stats |
| `npm run validate:sources -- file.csv` | Warn on weak source URLs |
| `npm run clean` | Remove `.next` (~50MB) |
