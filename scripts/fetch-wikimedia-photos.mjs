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
  "nicolas-jackson": "Nicolas Jackson (footballer, born 2001)",
  "heung-min-son": "Son Heung-min",
  "bruno-guimaraes": "Bruno Guimarães",
  "matteo-politano": "Matteo Politano",
  "aurelien-tchouameni": "Aurélien Tchouaméni",
  "desire-doue": "Désiré Doué",
  "ngolo-kante": "N'Golo Kanté",
  "jeremy-jacquet": "Jérémy Jacquet",
  "jose-sa": "José Sá",
  "goncalo-inacio": "Gonçalo Inácio",
  "francisco-trincao": "Francisco Trincão",
  "francisco-conceicao": "Francisco Conceição",
  "warren-zaire-emery": "Warren Zaïre-Emery",
  "maghnes-akliouche": "Maghnes Akliouche",
  "nico-orielly": "Nico O'Reilly",
  "joao-cancelo": "João Cancelo",
  "joao-felix": "João Félix",
  "ruben-dias": "Rúben Dias",
  "ruben-neves": "Rúben Neves",
  "nuno-mendes": "Nuno Mendes (footballer, born 2002)",
  "dayot-upamecano": "Dayot Upamecano",
  "jules-kounde": "Jules Koundé",
  "leny-yoro": "Leny Yoro",
  "ibrahima-konate": "Ibrahima Konaté",
  "bradley-barcola": "Bradley Barcola",
  "phil-foden": "Phil Foden",
  "jordan-pickford": "Jordan Pickford",
  "marc-guehi": "Marc Guéhi",
  "ivan-toney": "Ivan Toney",
  "elliot-anderson": "Elliot Anderson (footballer, born 2001)",
  "jarell-quansah": "Jarell Quansah",
  "diogo-costa": "Diogo Costa",
  "joao-neves": "João Neves",
  "lucas-hernandez": "Lucas Hernández",
  "theo-hernandez": "Theo Hernández",
  "rui-silva": "Rui Silva (footballer, born 1994)",
  "lucas-da-cunha": "Lucas Da Cunha",
  "samu-costa": "Samú Costa",
  "tino-livramento": "Tino Livramento",
  "esteban-lepaul": "Esteban Lepaul (footballer)",
};

/** When Wikipedia has no lead image, use a known Commons file (basename only). */
const COMMONS_FILE_OVERRIDES = {
  "luis-suarez": "Luis-Suarez.jpg",
  rodri:
    "RODRI - SWE vs ESP - UEFA EURO 2020 QUALIFIERS - 2019.10.15 (cropped).jpg",
  vitinha: "Vitinha (PSG).jpg",
  "nicolas-jackson": "Nicolas Jackson 20042025 (1).jpg",
  "matteo-politano": "Politano con uno striscione per Spinazzola.jpg",
  "lucas-hernandez": "Lucas Hernández.jpg",
  "theo-hernandez": "Theo Hernandez France v Norway 26 June 26-122.jpg",
  "lucas-da-cunha": "Lucas da Cunha france.jpg",
  "tino-livramento":
    "Newcastle United vs AFC Bournemouth, 5 September 2026 (17).jpg",
};

function wikiTitlesForPlayer(slug, name) {
  const primary = TITLE_OVERRIDES[slug] ?? name;
  const base = primary.replace(/\s+\([^)]+\)$/, "").trim();
  return [
    ...new Set([
      primary,
      base,
      `${base} (footballer)`,
      `${base} (football)`,
    ]),
  ];
}

async function commonsThumbForFile(fileBaseName) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("titles", `File:${fileBaseName}`);
  api.searchParams.set("prop", "imageinfo");
  api.searchParams.set("iiprop", "url");
  api.searchParams.set("iiurlwidth", "500");
  api.searchParams.set("format", "json");
  api.searchParams.set("origin", "*");

  const res = await fetch(api, { headers: { "User-Agent": UA } });
  const text = await res.text();
  if (!text.startsWith("{")) throw new Error(text.slice(0, 120));
  const data = JSON.parse(text);
  const page = Object.values(data.query?.pages ?? {})[0];
  const src = page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url;
  return src?.includes("wikimedia.org") ? src : null;
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

for (let attempt = 0; attempt < 4 && pending.size > 0; attempt++) {
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

for (const slug of [...pending.keys()]) {
  const fileName = COMMONS_FILE_OVERRIDES[slug];
  if (!fileName) continue;
  try {
    const src = await commonsThumbForFile(fileName);
    if (!src) continue;
    photoMap.set(slug, src);
    pending.delete(slug);
    await supabase.from("players").update({ photo_url: src }).eq("slug", slug);
    updated++;
    console.log("commons", slug);
  } catch (e) {
    console.warn("Commons failed", slug, e.message);
  }
  await sleep(2000);
}

for (const slug of pending.keys()) console.log("—", slug);

writePhotoMap(photoMap);
console.log(
  `Done. ${updated} photos set, ${pending.size} missed, CSV → ${path.relative(root, outCsv)}`,
);
