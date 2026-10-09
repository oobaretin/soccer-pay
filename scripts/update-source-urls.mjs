#!/usr/bin/env node
/**
 * Updates source_name + source_url on each player's latest contract from CSV.
 * Does not change wages. Usage: node scripts/update-source-urls.mjs data/players-batch-1.csv
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { getSupabaseAdminConfig, parseCsv } from "./lib/load-env.mjs";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("Usage: node scripts/update-source-urls.mjs <players.csv>");
  process.exit(1);
}

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);
const { records } = parseCsv(fs.readFileSync(file, "utf8"));

let ok = 0;
let skip = 0;

for (const r of records) {
  if (!r.player_slug || !r.source_url) {
    skip++;
    continue;
  }
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("slug", r.player_slug)
    .maybeSingle();
  if (!player) {
    console.warn("No player", r.player_slug);
    skip++;
    continue;
  }
  const { data: contract } = await supabase
    .from("contracts")
    .select("id")
    .eq("player_id", player.id)
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!contract) {
    console.warn("No contract", r.player_slug);
    skip++;
    continue;
  }
  const { error } = await supabase
    .from("contracts")
    .update({
      source_name: r.source_name,
      source_url: r.source_url,
    })
    .eq("id", contract.id);
  if (error) {
    console.error(r.player_slug, error.message);
    skip++;
  } else {
    ok++;
    console.log("Updated source", r.player_slug);
  }
}

console.log(`Done. ${ok} updated, ${skip} skipped.`);
