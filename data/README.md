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
