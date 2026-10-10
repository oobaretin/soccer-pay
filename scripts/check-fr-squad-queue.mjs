#!/usr/bin/env node
/**
 * Compare data/players-pending-fr-squad.csv against Supabase (club + player + salary list).
 * Usage: node scripts/check-fr-squad-queue.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal, parseCsv } from "./lib/load-env.mjs";

loadEnvLocal();

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const queuePath = path.join(root, "data/players-pending-fr-squad.csv");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const { records } = parseCsv(fs.readFileSync(queuePath, "utf8"));
const supabase = createClient(url, key);

const [{ data: clubs }, { data: players }, { data: contracts }] = await Promise.all([
  supabase.from("clubs").select("slug, name"),
  supabase.from("players").select("slug, name, club_id"),
  supabase.from("contracts").select("player_id, weekly_wage_gbp, annual_wage_gbp, reviewed_at, contract_end"),
]);

const clubSlugs = new Set((clubs ?? []).map((c) => c.slug));
const playerBySlug = new Map((players ?? []).map((p) => [p.slug, p]));

function latestContract(playerId) {
  const list = (contracts ?? []).filter((c) => c.player_id === playerId);
  if (!list.length) return null;
  return [...list].sort(
    (a, b) =>
      (b.reviewed_at ?? "").localeCompare(a.reviewed_at ?? "") ||
      (b.contract_end ?? "").localeCompare(a.contract_end ?? ""),
  )[0];
}

const alreadyOnList = [
  "william-saliba",
  "ousmane-dembele",
  "kylian-mbappe",
];

console.log("Already on salary list (not in queue CSV):");
for (const slug of alreadyOnList) {
  const p = playerBySlug.get(slug);
  console.log(`  ✓ ${slug}${p ? "" : " (missing from DB?)"}`);
}

console.log("\nImport queue:", records.length, "rows\n");

let ready = 0;
let needClub = 0;
let needWage = 0;
let inDb = 0;

for (const r of records) {
  const clubOk = clubSlugs.has(r.club_slug);
  const p = playerBySlug.get(r.player_slug);
  const onList =
    p &&
    (() => {
      const c = latestContract(p.id);
      return c && (c.weekly_wage_gbp != null || c.annual_wage_gbp != null);
    })();
  const hasWageInCsv =
    (r.weekly_wage_gbp && String(r.weekly_wage_gbp).trim()) ||
    (r.annual_wage_gbp && String(r.annual_wage_gbp).trim());
  const hasSource =
    r.source_url && String(r.source_url).trim() && r.source_name && String(r.source_name).trim();

  if (p) inDb++;
  if (!clubOk) needClub++;
  if (!hasWageInCsv || !hasSource) needWage++;
  if (clubOk && hasWageInCsv && hasSource && !onList) ready++;

  const flags = [
    !clubOk ? "MISSING_CLUB" : null,
    p ? (onList ? "ON_SALARY_LIST" : "IN_DB") : null,
    !hasWageInCsv || !hasSource ? "NEEDS_WAGE+SOURCE" : "IMPORT_READY",
  ]
    .filter(Boolean)
    .join(" · ");

  console.log(`${r.player_slug} → ${r.club_slug}: ${flags}`);
}

console.log("\nSummary");
console.log("  Clubs missing in DB:", [...new Set(records.filter((r) => !clubSlugs.has(r.club_slug)).map((r) => r.club_slug))].join(", ") || "none");
console.log("  Queue rows in DB already:", inDb);
console.log("  Rows ready to import (club + wage + source in CSV):", ready);
console.log("  Rows still need wage/source in CSV:", needWage);
console.log("\nClub research (names without club on your list): data/fr-squad-club-research.csv");
console.log("\nNext steps:");
console.log("  1. npm run import:clubs -- data/clubs-international.csv  (if any club_slug missing)");
console.log("  2. Fill wages + sources in data/players-pending-fr-squad.csv");
console.log("  3. npm run import:players -- data/players-pending-fr-squad.csv");
