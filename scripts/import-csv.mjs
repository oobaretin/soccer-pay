#!/usr/bin/env node
/**
 * Bulk import players, contracts, and season stats from CSV.
 *
 * Usage:
 *   node scripts/import-csv.mjs path/to/players.csv
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Columns: player_name, player_slug, club_slug, position, nationality, dob,
 *   weekly_wage_gbp, annual_wage_gbp, contract_start, contract_end,
 *   status, source_name, source_url, reviewed_at,
 *   season, appearances, goals, assists, minutes
 *
 * Re-importing the same player_slug updates the player row.
 * Contracts: updates row matching player_id + reviewed_at, else inserts.
 * Stats: upserts on (player_id, season).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { getSupabaseAdminConfig, parseCsv } from "./lib/load-env.mjs";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("Usage: node scripts/import-csv.mjs path/to/players.csv");
  process.exit(1);
}

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);
const { records } = parseCsv(fs.readFileSync(file, "utf8"));

const { data: clubs } = await supabase
  .from("clubs")
  .select("id,slug, leagues(currency)");
const clubBySlug = new Map(
  (clubs ?? []).map((c) => {
    const league = Array.isArray(c.leagues) ? c.leagues[0] : c.leagues;
    return [c.slug, { id: c.id, currency: league?.currency ?? "GBP" }];
  }),
);

const { error: wageNotesProbe } = await supabase
  .from("contracts")
  .select("wage_notes")
  .limit(0);
const hasWageNotesColumn = !wageNotesProbe;
if (wageNotesProbe) {
  console.warn(
    "contracts.wage_notes column missing — run scripts/add-wage-notes.sql (npm run db:wage-notes). Import continues without notes.",
  );
}

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

let imported = 0;
let skipped = 0;

for (const r of records) {
  if (!r.player_slug || !r.player_name) {
    skipped++;
    continue;
  }

  const club = clubBySlug.get(r.club_slug);
  if (!club) {
    console.warn(`Skip ${r.player_slug}: unknown club ${r.club_slug}`);
    skipped++;
    continue;
  }
  const clubId = club.id;
  const currency = (r.currency || club.currency || "GBP").toUpperCase();

  const weekly = num(r.weekly_wage_gbp);
  const annual =
    num(r.annual_wage_gbp) ?? (weekly != null ? weekly * 52 : null);

  const { data: player, error: pErr } = await supabase
    .from("players")
    .upsert(
      {
        name: r.player_name,
        slug: r.player_slug,
        club_id: clubId,
        position: r.position,
        nationality: r.nationality,
        date_of_birth: r.dob,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (pErr) {
    console.error(pErr.message, r.player_slug);
    skipped++;
    continue;
  }

  const reviewedAt = r.reviewed_at ?? new Date().toISOString().slice(0, 10);
  const contractPayload = {
    player_id: player.id,
    weekly_wage_gbp: weekly,
    annual_wage_gbp: annual,
    contract_start: r.contract_start,
    contract_end: r.contract_end,
    status: r.status ?? "reported",
    source_name: r.source_name,
    source_url: r.source_url,
    reviewed_at: reviewedAt,
    currency,
  };
  if (hasWageNotesColumn) {
    contractPayload.wage_notes = r.wage_notes?.trim() || null;
  }

  const { data: existingContract } = await supabase
    .from("contracts")
    .select("id")
    .eq("player_id", player.id)
    .eq("reviewed_at", reviewedAt)
    .maybeSingle();

  if (existingContract?.id) {
    await supabase
      .from("contracts")
      .update(contractPayload)
      .eq("id", existingContract.id);
  } else {
    await supabase.from("contracts").insert(contractPayload);
  }

  if (r.season) {
    await supabase.from("season_stats").upsert(
      {
        player_id: player.id,
        season: r.season,
        appearances: num(r.appearances),
        goals: num(r.goals),
        assists: num(r.assists),
        minutes: num(r.minutes),
      },
      { onConflict: "player_id,season" },
    );
  }

  imported++;
  console.log("Imported", r.player_slug);
}

console.log(`Done. ${imported} players, ${skipped} skipped.`);
