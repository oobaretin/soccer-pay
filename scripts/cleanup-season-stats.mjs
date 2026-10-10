#!/usr/bin/env node
/**
 * Remove mis-imported season_stats rows (season field was appearances, etc.).
 *
 * Usage: node scripts/cleanup-season-stats.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "./lib/load-env.mjs";

const dryRun = process.argv.includes("--dry-run");
const seasonRe = /^\d{4}-\d{2}$/;

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);

const { data: rows, error } = await supabase
  .from("season_stats")
  .select("id, player_id, season, appearances, goals");
if (error) {
  console.error(error.message);
  process.exit(1);
}

const bad = (rows ?? []).filter((r) => !seasonRe.test(r.season ?? ""));
console.log(`Found ${bad.length} invalid season rows (of ${rows?.length ?? 0}).`);

if (!bad.length) process.exit(0);

if (dryRun) {
  for (const r of bad.slice(0, 10)) {
    console.log("would delete", r.season, "apps", r.appearances, "goals", r.goals);
  }
  if (bad.length > 10) console.log(`… and ${bad.length - 10} more`);
  process.exit(0);
}

const ids = bad.map((r) => r.id);
const { error: delErr } = await supabase.from("season_stats").delete().in("id", ids);
if (delErr) {
  console.error(delErr.message);
  process.exit(1);
}
console.log(`Deleted ${ids.length} invalid rows.`);
