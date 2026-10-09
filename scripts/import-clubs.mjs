#!/usr/bin/env node
/**
 * Upsert clubs from data/clubs.csv (or path argument).
 * Usage: node scripts/import-clubs.mjs [path/to/clubs.csv]
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdminConfig, parseCsv } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2] ?? path.join(root, "data/clubs.csv");

if (!fs.existsSync(file)) {
  console.error("File not found:", file);
  process.exit(1);
}

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);
const { records } = parseCsv(fs.readFileSync(file, "utf8"));

const { data: leagues, error: leagueErr } = await supabase
  .from("leagues")
  .select("id,slug");
if (leagueErr) {
  console.error(
    "Could not read leagues. Run scripts/migrate-leagues.sql first.",
    leagueErr.message,
  );
  process.exit(1);
}
const leagueBySlug = new Map((leagues ?? []).map((l) => [l.slug, l.id]));

let ok = 0;
for (const r of records) {
  if (!r.name || !r.slug) continue;
  const leagueSlug = r.league_slug || "premier-league";
  const leagueId = leagueBySlug.get(leagueSlug) ?? null;
  if (r.league_slug && !leagueId) {
    console.warn("Unknown league", r.league_slug, "for", r.slug);
  }
  const { error } = await supabase.from("clubs").upsert(
    { name: r.name, slug: r.slug, league_id: leagueId },
    { onConflict: "slug" },
  );
  if (error) {
    console.error("Failed", r.slug, error.message);
  } else {
    ok++;
    console.log("Club", r.slug, leagueSlug);
  }
}

console.log(`Done. ${ok} clubs upserted.`);
