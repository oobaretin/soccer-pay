#!/usr/bin/env node
/**
 * Compare a pending squad CSV against Supabase (club + player + salary list).
 * Usage: node scripts/check-squad-queue.mjs data/players-pending-pt-squad.csv
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal, parseCsv } from "./lib/load-env.mjs";

loadEnvLocal();

const queuePath = process.argv[2];
if (!queuePath || !fs.existsSync(queuePath)) {
  console.error("Usage: node scripts/check-squad-queue.mjs <pending.csv>");
  process.exit(1);
}

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

console.log("Queue file:", path.basename(queuePath));
console.log("Rows:", records.length, "\n");

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
console.log("  Rows ready to import:", ready);
console.log("  Rows still need wage/source in CSV:", needWage);
