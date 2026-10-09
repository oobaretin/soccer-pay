# Soccer Pay

Premier League player salaries — cited sources, contract expiry flags, wage-per-goal/assist, club wage bills, compare, and SEO articles.

## Setup

1. Run in Supabase SQL editor (in order):
   - [`schema.sql`](./schema.sql)
   - [`scripts/seed-clubs.sql`](./scripts/seed-clubs.sql) — all 20 PL clubs
   - [`scripts/seed.sql`](./scripts/seed.sql) — sample Arsenal/Chelsea players (optional)
   - [`scripts/seed-season-stats.sql`](./scripts/seed-season-stats.sql) — if stats missing
2. Or: `npm run db:apply` with `SUPABASE_DB_URL` in `.env.local`
3. Copy [`.env.local.example`](./.env.local.example) → `.env.local` (URL + **anon** key for the app)
4. `npm run check:env` → `npm run dev`

## Bulk data (recommended)

1. **Clubs** (already in `seed-clubs.sql`, or CSV):
   ```bash
   npm run import:clubs
   # uses data/clubs.csv
   ```
2. **Players + wages + stats** — edit [`data/players.example.csv`](./data/players.example.csv), add rows, then:
   ```bash
   npm run import:players -- path/to/your.csv
   ```
   Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (server/scripts only).

Import behavior:

- **Players** upsert on `slug`
- **Contracts** update when `player_id` + `reviewed_at` match, else insert (keeps history)
- **Season stats** upsert on `(player_id, season)`; `annual_wage_gbp` defaults to `weekly × 52` if omitted

## Routes

| Path | Description |
|------|-------------|
| `/` | Sortable/searchable salary table |
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
| `npm run clean` | Remove `.next` (~50MB) |
