#!/usr/bin/env node
/**
 * Contract/club refresh batch 2 (Oct 2026): remaining stale expiries + club moves.
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
  console.log("OK", playerSlug);
}

const updates = [
  {
    slug: "karim-benzema",
    clearClub: true,
    contract: {
      weekly_wage_gbp: null,
      annual_wage_gbp: null,
      currency: "EUR",
      contract_start: "2026-02-03",
      contract_end: "2026-08-31",
      status: "estimated",
      source_name: "ESPN",
      source_url:
        "https://www.espn.com/soccer/story/_/id/49783743/karim-benzema-al-hilal-saudi-pro-league-transfers",
      wage_notes:
        "Free agent after Al Hilal exit Aug 2026; wages cleared until next sourced deal.",
    },
  },
  {
    slug: "roberto-firmino",
    clubSlug: "al-sadd",
    contract: {
      weekly_wage_gbp: 1_800_000,
      annual_wage_gbp: 93_600_000,
      currency: "SAR",
      contract_start: "2025-07-23",
      contract_end: "2027-06-30",
      status: "estimated",
      source_name: "Al Sadd SC",
      source_url:
        "https://al-saddclub.com/al-sadd-sign-brazilian-forward-roberto-firmino-until-2027/",
      wage_notes:
        "Al Sadd deal confirmed; wage still last known Al Ahli SAR figure until Qatar source found.",
    },
  },
  {
    slug: "vincent-aboubakar",
    clubSlug: "hatayspor",
    contract: {
      weekly_wage_gbp: 59_808,
      annual_wage_gbp: 3_110_000,
      currency: "EUR",
      contract_start: "2024-09-09",
      contract_end: "2025-06-30",
      status: "reported",
      source_name: "Anadolu Agency",
      source_url:
        "https://www.aa.com.tr/en/sports/cameroonian-forward-vincent-aboubakar-joins-besiktas-for-3rd-time/2793865",
      wage_notes:
        "Beşiktaş guarantee (EUR); 2024/25 Hatayspor loan per TFF. Post-2025 club unconfirmed — verify.",
    },
  },
  {
    slug: "mauro-icardi",
    clearClub: true,
    contract: {
      weekly_wage_gbp: 144_231,
      annual_wage_gbp: 7_500_000,
      currency: "EUR",
      contract_start: "2023-07-01",
      contract_end: "2026-06-30",
      status: "estimated",
      source_name: "Türkiye Today",
      source_url:
        "https://www.turkiyetoday.com/sports/galatasaray-face-icardi-uncertainty-as-contract-expires-today-3222923",
      wage_notes:
        "Galatasaray deal expired 30 Jun 2026; no extension signed — last Capology-scale wage retained.",
    },
  },
  {
    slug: "antoine-griezmann",
    contract: {
      weekly_wage_gbp: 280_000,
      annual_wage_gbp: 14_560_000,
      currency: "EUR",
      contract_start: "2023-07-01",
      contract_end: "2027-06-30",
      status: "reported",
      source_name: "Atlético de Madrid",
      source_url:
        "https://en.atleticodemadrid.com/noticias/griezmann-signs-contract-extension-until-2027",
      wage_notes: "Extended Jun 2025 through 30 Jun 2027.",
    },
  },
  {
    slug: "gerard-moreno",
    contract: {
      weekly_wage_gbp: 150_000,
      annual_wage_gbp: 7_800_000,
      currency: "EUR",
      contract_start: "2023-07-01",
      contract_end: "2027-06-30",
      status: "reported",
      source_name: "Villarreal CF",
      source_url:
        "https://villarrealcf.es/en/gerard-renews-his-villarreal-contract-until-2027/",
      wage_notes: "End date corrected to match club renewal announcement.",
    },
  },
  {
    slug: "heung-min-son",
    clubSlug: "lafc",
    contract: {
      weekly_wage_gbp: 199_398,
      annual_wage_gbp: 10_368_750,
      currency: "USD",
      contract_start: "2025-08-06",
      contract_end: "2027-12-31",
      status: "reported",
      source_name: "LAFC",
      source_url: "https://www.lafc.com/news/lafc-signs-global-football-icon-son-heung-min",
      wage_notes:
        "Permanent move from Spurs Aug 2025; base salary per Spotrac-style MLS reporting (~$10.37M/yr).",
    },
  },
  {
    slug: "bernardo-silva",
    clubSlug: "real-madrid",
    contract: {
      weekly_wage_gbp: 180_000,
      annual_wage_gbp: 9_360_000,
      currency: "GBP",
      contract_start: "2026-07-01",
      contract_end: "2028-06-30",
      status: "estimated",
      source_name: "Sky Sports",
      source_url:
        "https://www.skysports.com/transfer/news/12691/13554908/bernardo-silva-real-madrid-sign-manchester-city-midfielder-on-free-transfer-as-jose-mourinho-impact-continues",
      wage_notes:
        "Free transfer to Real Madrid summer 2026; wage placeholder from last Man City estimate until sourced.",
    },
  },
  {
    slug: "alexandre-lacazette",
    clubSlug: "neom-sc",
    contract: {
      weekly_wage_gbp: 170_000,
      annual_wage_gbp: 8_840_000,
      currency: "EUR",
      contract_start: "2025-07-01",
      contract_end: "2027-06-30",
      status: "reported",
      source_name: "NEOM SC",
      source_url:
        "https://www.neom.com/en-us/neom-sports-club/news/neom-sc-signs-global-star-alexandre-lacazette",
      wage_notes: "Two-year NEOM deal; wage band retained from Lyon-era estimate until Saudi source.",
    },
  },
  {
    slug: "jamie-vardy",
    clubSlug: "burnley",
    contract: {
      weekly_wage_gbp: 150_000,
      annual_wage_gbp: 7_800_000,
      currency: "GBP",
      contract_start: "2026-09-06",
      contract_end: "2027-06-30",
      status: "estimated",
      source_name: "Burnley FC",
      source_url: "https://www.burnleyfootballclub.com/media-article/vardy-joins-the-clarets",
      wage_notes: "Championship deal; wage placeholder from prior Leicester row until sourced.",
    },
  },
  {
    slug: "kieran-trippier",
    clubSlug: "wolverhampton-wanderers",
    contract: {
      weekly_wage_gbp: 120_000,
      annual_wage_gbp: 6_240_000,
      currency: "GBP",
      contract_start: "2026-07-01",
      contract_end: "2028-06-30",
      status: "reported",
      source_name: "Newcastle United",
      source_url:
        "https://www.newcastleunited.com/en/news/trippier-joins-wolves-after-magpies-exit",
      wage_notes: "Two-year Wolves deal after Newcastle exit.",
    },
  },
  {
    slug: "raul-jimenez",
    clubSlug: "wolverhampton-wanderers",
    contract: {
      weekly_wage_gbp: 130_000,
      annual_wage_gbp: 6_760_000,
      currency: "GBP",
      contract_start: "2026-06-09",
      contract_end: "2028-06-30",
      status: "reported",
      source_name: "Wolverhampton Wanderers",
      source_url:
        "https://www.wolves.co.uk/news/mens-first-team/20260609-raul-jimenez-makes-his-molineux-return/",
      wage_notes: "Two years plus optional 12 months per club.",
    },
  },
  {
    slug: "dominic-calvert-lewin",
    clubSlug: "leeds-united",
    contract: {
      weekly_wage_gbp: 100_000,
      annual_wage_gbp: 5_200_000,
      currency: "GBP",
      contract_start: "2025-08-15",
      contract_end: "2028-06-30",
      status: "reported",
      source_name: "Leeds United",
      source_url:
        "https://www.yorkshireeveningpost.co.uk/sport/football/leeds-united/leeds-united-transfer-news-dominic-calvert-lewin-statement-contract-5274096",
      wage_notes: "Three-year Leeds deal; ~£100k/wk cited in 2026 reports.",
    },
  },
];

for (const row of updates) {
  const { slug, contract, clubSlug, clearClub } = row;
  await upsertContract(slug, contract, { clubSlug, clearClub });
}

console.log("Batch 2 done. reviewed_at =", REVIEWED);
