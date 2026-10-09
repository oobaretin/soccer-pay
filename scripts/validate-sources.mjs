#!/usr/bin/env node
/**
 * Warns when CSV source_url looks like a site homepage, not an article.
 * Usage: node scripts/validate-sources.mjs data/players-batch-1.csv
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-sources.mjs <csv>");
  process.exit(1);
}

const { records } = parseCsv(fs.readFileSync(path.resolve(root, file), "utf8"));

let warnings = 0;
const urlToSlugs = new Map();
for (const row of records) {
  const name = row.player_name ?? row.player_slug ?? "row";
  const url = row.source_url?.trim();
  if (!url) continue;
  const slug = row.player_slug ?? row.player_name ?? "row";
  const list = urlToSlugs.get(url) ?? [];
  list.push(slug);
  urlToSlugs.set(url, list);
  try {
    const u = new URL(url);
    const depth = u.pathname.replace(/\/$/, "").split("/").filter(Boolean).length;
    const looksLikeHome =
      depth <= 1 ||
      /\/(football|premier-league|calcio|futbol)\/?$/.test(u.pathname);
    if (looksLikeHome) {
      console.warn(`⚠ ${name}: homepage-style URL (${url})`);
      warnings++;
    }
    if (url.includes("example.com")) {
      console.warn(`⚠ ${name}: placeholder example.com URL`);
      warnings++;
    }
  } catch {
    console.warn(`⚠ ${name}: invalid URL (${url})`);
    warnings++;
  }
}

for (const [url, slugs] of urlToSlugs) {
  if (slugs.length > 1) {
    console.warn(
      `⚠ Shared URL (${slugs.join(", ")}): ${url}`,
    );
    warnings++;
  }
}

if (warnings === 0) {
  console.log("No source URL warnings.");
} else {
  console.log(
    `\n${warnings} warning(s). Use article-level links — see data/source-urls-*.csv.`,
  );
  process.exit(2);
}
