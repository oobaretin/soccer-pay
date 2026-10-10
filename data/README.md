# Data imports

## Batch 1 — `players-batch-1.csv`

Top earners across **18 clubs** (Arsenal/Chelsea already in `scripts/seed.sql`).

```bash
npm run import:players -- data/players-batch-1.csv
```

## Batch 2 — `players-batch-2.csv`

- Refreshes **Arsenal/Chelsea** seed players with better labels and article-style `source_url` placeholders (replace with real links).
- Adds **Brighton, Fulham, Leicester, Ipswich, Southampton**, plus depth at Newcastle/Chelsea.

```bash
npm run import:players -- data/players-batch-2.csv
```

## Source URLs

- Wages are **reported** or **estimated** from public outlets — not scraped from wage-aggregator sites.
- Run `npm run validate:sources -- data/your.csv` before go-live.
- Leave `annual_wage_gbp` empty to auto-fill as `weekly × 52` on import.

Same `player_slug` on re-import **updates** the player row and adds/updates contracts per import rules.

## International salaries — `players-international-batch-1.csv`

One flagship player per non-PL club (EUR / TRY / SAR). Figures are **estimated or reported** — replace `source_url` with real articles.

```bash
npm run import:players -- data/players-international-batch-1.csv
```

Optional CSV column `currency` (defaults from the club’s league).

Optional `wage_notes` on a contract row (shown on the player page) for bonuses, image rights, or revenue-share not captured in weekly/annual columns.

## Player photos

Portrait URLs live in `players.photo_url` (Wikimedia thumbnails are typical). Optional CSV column `photo_url` on player import rows, or maintain `data/player-photos.csv`:

```bash
npm run fetch:photos          # Wikipedia search → CSV + Supabase (missing only)
npm run import:photos         # push data/player-photos.csv to Supabase
```

## Portugal World Cup squad — `players-pt-squad-batch-1.csv`

Club wages for Seleção players (same workflow as French squad). Pending Liga / home-market names: `players-pending-pt-squad.csv`. Check queue:

```bash
npm run check:pt-squad
```

Article: `/articles/portugal-world-cup-2026-salaries`.

## International batch 2 — `players-international-batch-2.csv`

More flagship names (Mbappé, Bellingham, Musiala, Kvaratskhelia, Sané, Miami squad, etc.):

```bash
npm run import:players -- data/players-international-batch-2.csv
```

## Tighten source links (no re-import of wages)

Article-level URLs live in `source-urls-pl.csv` and `source-urls-international.csv`. Push them to Supabase:

```bash
npm run update:sources -- data/source-urls-pl.csv
npm run update:sources -- data/source-urls-international.csv
```

Then check:

```bash
npm run validate:sources -- data/players-batch-1.csv
```
