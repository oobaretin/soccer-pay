#!/usr/bin/env node
/** Tadić (NEC) + Aboubakar (Bodrum FK) — Oct 2026 */
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "./lib/load-env.mjs";

const REVIEWED = "2026-10-09";

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);

async function ensureLeagues() {
  const rows = [
    {
      name: "Eredivisie",
      slug: "eredivisie",
      country: "Netherlands",
      currency: "EUR",
    },
  ];
  for (const row of rows) {
    const { error } = await supabase
      .from("leagues")
      .upsert(row, { onConflict: "slug" });
    if (error) throw error;
  }
}

async function ensureClub(name, slug, leagueSlug) {
  const { data: league } = await supabase
    .from("leagues")
    .select("id")
    .eq("slug", leagueSlug)
    .single();
  if (!league) throw new Error(`League missing: ${leagueSlug}`);
  const { error } = await supabase
    .from("clubs")
    .upsert({ name, slug, league_id: league.id }, { onConflict: "slug" });
  if (error) throw error;
}

async function playerId(slug) {
  const { data, error } = await supabase
    .from("players")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Player not found: ${slug}`);
  return data.id;
}

async function clubId(slug) {
  const { data, error } = await supabase
    .from("clubs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Club not found: ${slug}`);
  return data.id;
}

async function upsertContract(playerSlug, contract, clubSlug) {
  const pid = await playerId(playerSlug);
  const cid = await clubId(clubSlug);
  await supabase.from("players").update({ club_id: cid }).eq("id", pid);

  const payload = { player_id: pid, reviewed_at: REVIEWED, ...contract };
  const { data: existing } = await supabase
    .from("contracts")
    .select("id")
    .eq("player_id", pid)
    .eq("reviewed_at", REVIEWED)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("contracts")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("contracts").insert(payload);
    if (error) throw error;
  }
  console.log("OK", playerSlug, "→", clubSlug);
}

await ensureLeagues();
await ensureClub("N.E.C.", "nec-nijmegen", "eredivisie");
await ensureClub("Bodrum FK", "bodrum-fk", "super-lig");

await upsertContract(
  "dusan-tadic",
  {
    weekly_wage_gbp: 30_192,
    annual_wage_gbp: 1_570_000,
    currency: "EUR",
    contract_start: "2026-07-27",
    contract_end: "2028-06-30",
    status: "estimated",
    source_name: "Capology",
    source_url: "https://www.capology.com/player/dusan-tadic-32467/",
    wage_notes:
      "Capology gross fixed estimate €1.57M/yr; NEC confirmed deal to 2028 but did not publish pay.",
  },
  "nec-nijmegen",
);

await upsertContract(
  "vincent-aboubakar",
  {
    weekly_wage_gbp: null,
    annual_wage_gbp: null,
    currency: "EUR",
    contract_start: "2026-08-28",
    contract_end: "2027-06-30",
    status: "estimated",
    source_name: "Habertürk",
    source_url:
      "https://www.haberturk.com/spor/vincent-aboubakar-bodrum-fk-ya-imzayi-atti-3908968",
    wage_notes:
      "1+1 Bodrum deal Aug 2026; wage not disclosed. Prior Beşiktaş KAP €3.11M/yr is not current Bodrum pay.",
  },
  "bodrum-fk",
);

console.log("Batch 3 done.");
