#!/usr/bin/env node
/**
 * Backfill 2024-25 club stats from English Wikipedia career tables (Soccerbase-sourced).
 *
 * Scope: club appearances and goals, all competitions (season total column).
 * Assists and minutes are usually omitted on Wikipedia and left null.
 *
 * Usage:
 *   node scripts/fetch-season-stats.mjs              # fill missing 2024-25 only
 *   node scripts/fetch-season-stats.mjs --force      # refresh Wikipedia rows only (never CSV import)
 */
import { createClient } from "@supabase/supabase-js";
import { wikiTitlesForPlayer } from "./lib/wikipedia-titles.mjs";
import { getSupabaseAdminConfig } from "./lib/load-env.mjs";

const TARGET_SEASON = "2024-25";
const WIKI_SEASON_LABELS = ["2024–25", "2024-25"];
const SCOPE =
  "Club totals, all competitions (English Wikipedia career statistics; typically Soccerbase).";
const SOURCE_NAME = "Wikipedia";
const UA =
  "SoccerPay/1.0 (https://github.com/oobaretin/soccer-pay; season stats import)";
const force = process.argv.includes("--force");
const delayMs = 1600;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const CLUB_SEASON_MARKER =
  /\[\[2024[–-]25[^\]]*season\|2024[–-]25\]\]/g;

function parseTotalsFromChunk(chunk) {
  for (const line of chunk.split("\n")) {
    if (!/^\|/.test(line)) continue;
    if (/<ref|{{|\[\[/i.test(line)) continue;
    if (
      /Premier League|La Liga|Serie A|Ligue 1|Bundesliga|Primeira Liga|Division/i.test(
        line,
      )
    ) {
      continue;
    }
    const nums = [...line.matchAll(/\|\s*(\d+)\s*(?:\||$)/g)].map((m) =>
      Number(m[1]),
    );
    if (nums.length >= 2) {
      return {
        appearances: nums.at(-2),
        goals: nums.at(-1),
        assists: null,
        minutes: null,
      };
    }
  }
  return null;
}

function parseSeasonTotals(wikitext) {
  const candidates = [];
  for (const m of wikitext.matchAll(CLUB_SEASON_MARKER)) {
    const idx = m.index ?? 0;
    const refEnd = wikitext.indexOf("</ref>", idx);
    const start = refEnd !== -1 && refEnd - idx < 2500 ? refEnd + 6 : idx;
    const chunk = wikitext.slice(start, start + 900);
    const totals = parseTotalsFromChunk(chunk);
    if (totals) candidates.push(totals);
  }

  if (candidates.length === 0) {
    for (const label of WIKI_SEASON_LABELS) {
      const idx = wikitext.indexOf(`|${label}]]`);
      if (idx === -1) continue;
      const refEnd = wikitext.indexOf("</ref>", idx);
      const start = refEnd !== -1 && refEnd - idx < 2500 ? refEnd + 6 : idx;
      const totals = parseTotalsFromChunk(wikitext.slice(start, start + 900));
      if (totals) candidates.push(totals);
    }
  }

  if (!candidates.length) return null;
  return candidates.reduce((a, b) =>
    (b.appearances ?? 0) > (a.appearances ?? 0) ? b : a,
  );
}

async function fetchWikitext(pageTitle) {
  const api = new URL("https://en.wikipedia.org/w/api.php");
  api.searchParams.set("action", "parse");
  api.searchParams.set("page", pageTitle);
  api.searchParams.set("prop", "wikitext");
  api.searchParams.set("format", "json");
  api.searchParams.set("origin", "*");

  const res = await fetch(api, { headers: { "User-Agent": UA } });
  const text = await res.text();
  if (!text.startsWith("{")) throw new Error(text.slice(0, 120));
  const data = JSON.parse(text);
  if (data.error) return null;
  return {
    wikitext: data.parse?.wikitext?.["*"] ?? "",
    pageTitle: data.parse?.title ?? pageTitle,
  };
}

async function resolveStatsForPlayer(slug, name) {
  const titles = wikiTitlesForPlayer(slug, name);
  for (const title of titles) {
    await sleep(delayMs);
    try {
      const parsed = await fetchWikitext(title);
      if (!parsed?.wikitext) continue;
      const totals = parseSeasonTotals(parsed.wikitext);
      if (!totals) continue;
      const sourceUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(parsed.pageTitle.replace(/ /g, "_"))}`;
      return { ...totals, sourceUrl, wikiTitle: parsed.pageTitle };
    } catch {
      /* try next title */
    }
  }
  return null;
}

const CSV_SOURCE = "CSV import";

function isProtectedRow(row) {
  return row?.source_name === CSV_SOURCE;
}

function needsFetch(row) {
  if (isProtectedRow(row)) return false;
  if (force) return true;
  if (!row) return true;
  const empty =
    row.appearances == null &&
    row.goals == null &&
    row.assists == null &&
    row.minutes == null;
  if (empty) return true;
  if (row.source_name === SOURCE_NAME && (row.appearances ?? 0) < 8) return true;
  return false;
}

function mergeWikiWithExisting(wiki, cur) {
  if (!cur || isProtectedRow(cur)) return wiki;
  const wikiApps = wiki.appearances ?? 0;
  const curApps = cur.appearances ?? 0;
  if (curApps > wikiApps) {
    return {
      appearances: cur.appearances,
      goals: cur.goals,
      assists: cur.assists,
      minutes: cur.minutes,
      keepSource: true,
    };
  }
  return {
    ...wiki,
    assists: wiki.assists ?? cur.assists ?? null,
    minutes: wiki.minutes ?? cur.minutes ?? null,
    keepSource: false,
  };
}

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);

const { error: probe } = await supabase
  .from("season_stats")
  .select("source_name, scope")
  .limit(0);
const hasMeta = !probe;
if (!hasMeta) {
  console.warn(
    "season_stats source columns missing — run npm run db:stats-meta (stats will import without attribution until then).",
  );
}

const { data: players, error: pErr } = await supabase
  .from("players")
  .select("id, slug, name")
  .order("name");
if (pErr) {
  console.error(pErr.message);
  process.exit(1);
}

const { data: existing } = await supabase
  .from("season_stats")
  .select("*")
  .eq("season", TARGET_SEASON);
const byPlayer = new Map((existing ?? []).map((s) => [s.player_id, s]));

let updated = 0;
let missed = 0;

for (const p of players ?? []) {
  const cur = byPlayer.get(p.id);
  if (!needsFetch(cur)) continue;

  const stats = await resolveStatsForPlayer(p.slug, p.name);
  if (!stats) {
    missed++;
    console.log("—", p.slug);
    continue;
  }

  const merged = mergeWikiWithExisting(stats, cur);
  const payload = {
    player_id: p.id,
    season: TARGET_SEASON,
    appearances: merged.appearances,
    goals: merged.goals,
    assists: merged.assists ?? null,
    minutes: merged.minutes ?? null,
  };
  if (hasMeta && !merged.keepSource) {
    payload.source_name = SOURCE_NAME;
    payload.source_url = stats.sourceUrl;
    payload.scope = SCOPE;
  } else if (hasMeta && merged.keepSource && cur) {
    payload.source_name = cur.source_name;
    payload.source_url = cur.source_url;
    payload.scope = cur.scope;
  }

  const { error: upErr } = await supabase
    .from("season_stats")
    .upsert(payload, { onConflict: "player_id,season" });
  if (upErr) {
    console.warn("fail", p.slug, upErr.message);
    missed++;
    continue;
  }
  updated++;
  console.log("ok", p.slug, stats.appearances, "apps", stats.goals, "g");
}

console.log(`Done. ${updated} updated, ${missed} missed (${TARGET_SEASON}).`);
