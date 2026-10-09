#!/usr/bin/env node
/**
 * Copies source_name + source_url from data/source-urls-*.csv into player import CSVs.
 * Usage: node scripts/sync-source-urls-to-player-csvs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(headers, records) {
  const lines = [headers.join(",")];
  for (const row of records) {
    lines.push(headers.map((h) => escapeCsv(row[h] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function loadCanonical() {
  const map = new Map();
  for (const file of [
    "data/source-urls-pl.csv",
    "data/source-urls-international.csv",
  ]) {
    const { records } = parseCsv(
      fs.readFileSync(path.join(root, file), "utf8"),
    );
    for (const r of records) {
      if (!r.player_slug) continue;
      map.set(r.player_slug, {
        source_name: r.source_name,
        source_url: r.source_url,
      });
    }
  }
  return map;
}

const canonical = loadCanonical();
const playerFiles = [
  "data/players-batch-1.csv",
  "data/players-batch-2.csv",
  "data/players-international-batch-1.csv",
  "data/players-international-batch-2.csv",
];

let updated = 0;
for (const rel of playerFiles) {
  const abs = path.join(root, rel);
  const text = fs.readFileSync(abs, "utf8");
  const { headers, records } = parseCsv(text);
  let fileUpdated = 0;
  for (const row of records) {
    const src = canonical.get(row.player_slug);
    if (!src) continue;
    if (
      row.source_name !== src.source_name ||
      row.source_url !== src.source_url
    ) {
      row.source_name = src.source_name;
      row.source_url = src.source_url;
      fileUpdated++;
    }
  }
  if (fileUpdated > 0) {
    fs.writeFileSync(abs, writeCsv(headers, records));
    updated += fileUpdated;
    console.log(`${rel}: ${fileUpdated} row(s) updated`);
  }
}

console.log(`Done. ${updated} total row(s) synced.`);
