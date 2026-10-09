#!/usr/bin/env node
/**
 * Fails if CSV rows look like euro-scale amounts stored as TRY (common import mistake).
 * Usage: node scripts/validate-currency-sanity.mjs [csv...]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const files =
  process.argv.length > 2
    ? process.argv.slice(2).map((f) => path.resolve(f))
    : [
        path.join(root, "data/players-batch-1.csv"),
        path.join(root, "data/players-batch-2.csv"),
        path.join(root, "data/players-international-batch-1.csv"),
        path.join(root, "data/players-international-batch-2.csv"),
      ];

const TRY_WEEKLY_MAX = 500_000;
const TRY_ANNUAL_MAX = 15_000_000;

let errors = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const { records } = parseCsv(fs.readFileSync(file, "utf8"));
  for (const row of records) {
    const cur = (row.currency ?? "GBP").toUpperCase();
    if (cur !== "TRY") continue;
    const weekly = Number(row.weekly_wage_gbp);
    const annual = Number(row.annual_wage_gbp);
    const slug = row.player_slug ?? row.player_name ?? "?";
    if (Number.isFinite(weekly) && weekly > TRY_WEEKLY_MAX) {
      console.error(`${path.basename(file)}: ${slug} TRY weekly ${weekly} looks mislabeled`);
      errors++;
    }
    if (Number.isFinite(annual) && annual > TRY_ANNUAL_MAX) {
      console.error(`${path.basename(file)}: ${slug} TRY annual ${annual} looks mislabeled`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`\n${errors} currency sanity error(s).`);
  process.exit(1);
}
console.log("Currency sanity OK.");
