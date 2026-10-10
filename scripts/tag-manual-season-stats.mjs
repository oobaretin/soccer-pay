#!/usr/bin/env node
/** Label pre-import CSV stats rows that have figures but no source metadata. */
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "./lib/load-env.mjs";

const SCOPE =
  "Club totals (manual CSV import; verify against official or Wikipedia before treating as authoritative).";

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);

const { error: probe } = await supabase
  .from("season_stats")
  .select("source_name")
  .limit(0);
if (probe) {
  console.log("No source_name column — run npm run db:stats-meta first.");
  process.exit(0);
}

const { data, error } = await supabase
  .from("season_stats")
  .select("*")
  .eq("season", "2024-25");
if (error) {
  console.error(error.message);
  process.exit(1);
}

let n = 0;
for (const row of data ?? []) {
  const hasFigures =
    row.appearances != null ||
    row.goals != null ||
    row.assists != null ||
    row.minutes != null;
  if (!hasFigures || row.source_name) continue;
  const { error: upErr } = await supabase
    .from("season_stats")
    .update({ source_name: "CSV import", scope: SCOPE })
    .eq("id", row.id);
  if (!upErr) n++;
}
console.log(`Tagged ${n} manual CSV stat rows.`);
