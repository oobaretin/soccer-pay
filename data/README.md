# Data imports

## Batch 1 — `players-batch-1.csv`

Top earners across **18 clubs** (Arsenal/Chelsea already in `scripts/seed.sql`).

- Wages are **reported** or **estimated** from public outlets — not scraped from wage aggregator sites.
- Replace `source_url` with the **specific article** when you verify a figure.
- Leave `annual_wage_gbp` empty to auto-fill as `weekly × 52` on import.

```bash
npm run import:players -- data/players-batch-1.csv
```

Add batch 2 by copying this file, editing rows, and re-running import (same `player_slug` updates the row).
