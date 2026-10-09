#!/usr/bin/env node
/**
 * One-off contract/club refresh (Oct 2026): Turkish EUR wages, top expired deals.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "./lib/load-env.mjs";

const REVIEWED = "2026-10-09";

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);

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

async function upsertContract(playerSlug, contract, { clubSlug, clearClub } = {}) {
  const pid = await playerId(playerSlug);
  if (clubSlug) {
    const cid = await clubId(clubSlug);
    const { error: pe } = await supabase
      .from("players")
      .update({ club_id: cid })
      .eq("id", pid);
    if (pe) throw pe;
  } else if (clearClub) {
    const { error: pe } = await supabase
      .from("players")
      .update({ club_id: null })
      .eq("id", pid);
    if (pe) throw pe;
  }

  const payload = {
    player_id: pid,
    reviewed_at: REVIEWED,
    ...contract,
  };

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
  console.log("OK", playerSlug);
}

const updates = [
  {
    slug: "mauro-icardi",
    contract: {
      weekly_wage_gbp: 144_231,
      annual_wage_gbp: 7_500_000,
      currency: "EUR",
      contract_start: "2023-07-01",
      contract_end: "2026-06-30",
      status: "reported",
      source_name: "Capology",
      source_url: "https://www.capology.com/player/mauro-icardi-34019/",
      wage_notes:
        "Gross fixed weekly per Capology (~€7.5M/yr). Previously stored as TRY at euro-scale amounts.",
    },
  },
  {
    slug: "dusan-tadic",
    contract: {
      weekly_wage_gbp: 80_769,
      annual_wage_gbp: 4_200_000,
      currency: "EUR",
      contract_start: "2023-07-01",
      contract_end: "2026-06-30",
      status: "reported",
      source_name: "Fenerbahçe (disclosure)",
      source_url:
        "https://www.fcupdate.nl/voetbalnieuws/2023/07/fenerbahce-maakt-fors-miljoenensalaris-van-dusan-tadic-bekend",
      wage_notes: "€4.2M per season per club statement (2023/24–2024/25); ÷52 for weekly.",
    },
  },
  {
    slug: "vincent-aboubakar",
    contract: {
      weekly_wage_gbp: 59_808,
      annual_wage_gbp: 3_110_000,
      currency: "EUR",
      contract_start: "2023-01-21",
      contract_end: "2025-06-30",
      status: "reported",
      source_name: "Anadolu Agency",
      source_url:
        "https://www.aa.com.tr/en/sports/cameroonian-forward-vincent-aboubakar-joins-besiktas-for-3rd-time/2793865",
      wage_notes:
        "€3.1M/season guarantee per Beşiktaş disclosure; TFF shows 2024/25 Hatayspor loan. Club row still Beşiktaş until Hatayspor is added.",
    },
  },
  {
    slug: "anastasios-bakasetas",
    contract: {
      weekly_wage_gbp: 33_654,
      annual_wage_gbp: 1_750_000,
      currency: "EUR",
      contract_start: "2023-07-01",
      contract_end: "2027-06-30",
      status: "estimated",
      source_name: "Milliyet",
      source_url:
        "https://www.milliyet.com.tr/skorer/trabzonspordan-anastasios-bakasetas-karari-iste-onerilen-yeni-sartlar-7050844",
      wage_notes: "Reported €1.75M/yr renewal offer (Dec 2023); treat as estimate until KAP confirms.",
    },
  },
  {
    slug: "lionel-messi",
    contract: {
      weekly_wage_gbp: 1_000_000,
      annual_wage_gbp: 52_000_000,
      currency: "USD",
      contract_start: "2023-07-15",
      contract_end: "2028-12-31",
      status: "reported",
      source_name: "Inter Miami CF",
      source_url:
        "https://www.intermiamicf.com/news/inter-miami-cf-signs-leo-messi-to-contract-extension",
      wage_notes: "Extended through 2028 MLS season; base pay band unchanged in table.",
    },
  },
  {
    slug: "luis-suarez",
    contract: {
      weekly_wage_gbp: 500_000,
      annual_wage_gbp: 26_000_000,
      currency: "USD",
      contract_start: "2024-01-01",
      contract_end: "2026-12-31",
      status: "reported",
      source_name: "Inter Miami CF",
      source_url:
        "https://www.intermiamicf.com/news/inter-miami-cf-signs-luis-suarez-to-a-new-contract",
      wage_notes: "One-year deal for 2026 MLS season per club.",
    },
  },
  {
    slug: "sergio-busquets",
    contract: {
      weekly_wage_gbp: 450_000,
      annual_wage_gbp: 23_400_000,
      currency: "USD",
      contract_start: "2023-07-01",
      contract_end: "2025-12-31",
      status: "reported",
      source_name: "Miami Herald",
      source_url:
        "https://www.miamiherald.com/sports/mls/inter-miami/article312268153.html",
      wage_notes: "Retired after 2025 MLS season; final-year wage retained for ranking history.",
    },
  },
  {
    slug: "karim-benzema",
    clubSlug: "al-hilal",
    contract: {
      weekly_wage_gbp: 3_200_000,
      annual_wage_gbp: 166_400_000,
      currency: "SAR",
      contract_start: "2026-02-03",
      contract_end: "2026-08-31",
      status: "estimated",
      source_name: "ESPN",
      source_url:
        "https://www.espn.com/soccer/story/_/id/49783743/karim-benzema-al-hilal-saudi-pro-league-transfers",
      wage_notes:
        "Mutual termination with Al Hilal Aug 2026; wage left at last Saudi deal — verify if free-agent.",
    },
  },
  {
    slug: "roberto-firmino",
    contract: {
      weekly_wage_gbp: 1_800_000,
      annual_wage_gbp: 93_600_000,
      currency: "SAR",
      contract_start: "2025-07-23",
      contract_end: "2027-06-30",
      status: "reported",
      source_name: "Al Sadd SC",
      source_url:
        "https://al-saddclub.com/al-sadd-sign-brazilian-forward-roberto-firmino-until-2027/",
      wage_notes:
        "Left Al Ahli Jul 2025 for Al Sadd (Qatar); club still listed as Al Ahli until Qatar club is in DB.",
    },
  },
  {
    slug: "jordan-henderson",
    clearClub: true,
    contract: {
      weekly_wage_gbp: null,
      annual_wage_gbp: null,
      currency: "EUR",
      contract_start: "2024-01-18",
      contract_end: "2025-07-10",
      status: "estimated",
      source_name: "AFC Ajax",
      source_url: "https://english.ajax.nl/articles/jordan-henderson-leaves-ajax",
      wage_notes:
        "Ajax contract ended Jul 2025 by mutual consent; free agent — wages cleared pending next club.",
    },
  },
];

for (const row of updates) {
  const { slug, contract, clubSlug, clearClub } = row;
  await upsertContract(slug, contract, { clubSlug, clearClub });
}

console.log("Done. reviewed_at =", REVIEWED);
