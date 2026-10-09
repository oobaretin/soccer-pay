#!/usr/bin/env node
/**
 * Fill photo_url from Wikipedia/Wikimedia thumbnails (CC-licensed portraits).
 *
 * Usage: node scripts/fetch-wikimedia-photos.mjs [--force]
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdminConfig, parseCsv } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outCsv = path.join(root, "data/player-photos.csv");
const force = process.argv.includes("--force");
const UA = "SoccerPay/1.0 (https://github.com/oobaretin/soccer-pay; batch photo import)";

const TITLE_OVERRIDES = {
  "dusan-tadic": "Dušan Tadić",
  "dusan-vlahovic": "Dušan Vlahović",
  "mauro-icardi": "Mauro Icardi",
  "sergio-busquets": "Sergio Busquets",
  "luis-suarez": "Luis Suárez",
  "kylian-mbappe": "Kylian Mbappé",
  "ousmane-dembele": "Ousmane Dembélé",
  "leroy-sane": "Leroy Sané",
  "vitinha": "Vitinha (footballer, born 2000)",
  "rodri": "Rodri (footballer, born 1996)",
  "vinicius-junior": "Vinícius Júnior",
  "lamine-yamal": "Lamine Yamal",
  "khvicha-kvaratskhelia": "Khvicha Kvaratskhelia",
  "takefusa-kubo": "Takefusa Kubo",
  "youssef-en-nesyri": "Youssef En-Nesyri",
  "moises-caicedo": "Moisés Caicedo",
  "martin-odegaard": "Martin Ødegaard",
  "joao-pedro": "João Pedro (footballer, born 2001)",
  "rafael-leao": "Rafael Leão",
  "matheus-cunha": "Matheus Cunha",
  "lois-openda": "Loïs Openda",
  "nicolas-jackson": "Nicolas Jackson (footballer)",
  "heung-min-son": "Son Heung-min",
  "bruno-guimaraes": "Bruno Guimarães",
  "matteo-politano": "Matteo Politano",
  "nicolas-jackson": "Nicolas Jackson (footballer, born 2001)",
};

function wikiTitlesForPlayer(slug, name) {
  const primary = TITLE_OVERRIDES[slug] ?? name;
  const base = primary.replace(/\s+\([^)]+\)$/, "");
  return [...new Set([primary, `${base} (footballer)`, `${base} (football)`])];
}

async function wikiQueryTitles(titles) {
  const api = new URL("https://en.wikipedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("titles", titles.join("|"));
  api.searchParams.set("prop", "pageimages");
  api.searchParams.set("piprop", "thumbnail");
  api.searchParams.set("pithumbsize", "400");
  api.searchParams.set("format", "json");
  api.searchParams.set("origin", "*");

  const res = await fetch(api, { headers: { "User-Agent": UA } });
  const text = await res.text();
  if (!text.startsWith("{")) throw new Error(text.slice(0, 120));
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadPhotoMap() {
  const map = new Map();
  if (fs.existsSync(outCsv)) {
    const { records } = parseCsv(fs.readFileSync(outCsv, "utf8"));
    for (const r of records) {
      if (r.player_slug && r.photo_url) map.set(r.player_slug, r.photo_url);
    }
  }
  return map;
}

function writePhotoMap(map) {
  const lines = ["player_slug,photo_url"];
  for (const [slug, url] of [...map.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const u = url.includes(",") ? `"${url.replace(/"/g, '""')}"` : url;
    lines.push(`${slug},${u}`);
  }
  fs.writeFileSync(outCsv, `${lines.join("\n")}\n`);
}

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);

const { data: players, error } = await supabase
  .from("players")
  .select("id, slug, name, photo_url")
  .order("name");
if (error) {
  console.error(error.message);
  process.exit(1);
}

const photoMap = loadPhotoMap();
const pending = new Map();
for (const p of players ?? []) {
  if (!force && p.photo_url) continue;
  pending.set(p.slug, { id: p.id, titles: wikiTitlesForPlayer(p.slug, p.name) });
}

let updated = 0;

for (let attempt = 0; attempt < 3 && pending.size > 0; attempt++) {
  const slugs = [...pending.keys()];
  for (let i = 0; i < slugs.length; i += 50) {
    const chunk = slugs.slice(i, i + 50);
    const titleToSlug = new Map();
    for (const slug of chunk) {
      const title = pending.get(slug).titles[attempt];
      if (title) titleToSlug.set(title, slug);
    }
    const titles = [...titleToSlug.keys()];
    if (!titles.length) continue;

    let data;
    try {
      data = await wikiQueryTitles(titles);
    } catch (e) {
      console.warn("Rate limited, waiting…", e.message);
      await sleep(8000);
      data = await wikiQueryTitles(titles);
    }

    const pages = data.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      if (page.missing !== undefined || !page.title) continue;
      const src = page.thumbnail?.source;
      if (!src?.includes("wikimedia.org")) continue;
      const slug = titleToSlug.get(page.title);
      if (!slug || !pending.has(slug)) continue;
      photoMap.set(slug, src);
      pending.delete(slug);
      await supabase.from("players").update({ photo_url: src }).eq("slug", slug);
      updated++;
      console.log("ok", slug);
    }
    await sleep(1500);
  }
}

for (const slug of pending.keys()) console.log("—", slug);

writePhotoMap(photoMap);
console.log(
  `Done. ${updated} photos set, ${pending.size} missed, CSV → ${path.relative(root, outCsv)}`,
);
