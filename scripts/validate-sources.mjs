#!/usr/bin/env node
/**
 * Warns when CSV source_url looks like a site homepage, not an article.
 * Usage: node scripts/validate-sources.mjs data/players-batch-1.csv
 */
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-sources.mjs <csv>");
  process.exit(1);
}

const text = fs.readFileSync(path.resolve(file), "utf8");
const lines = text.trim().split("\n");
const header = lines[0].split(",");
const urlIdx = header.indexOf("source_url");
const nameIdx = header.indexOf("player_name");
if (urlIdx === -1) {
  console.error("CSV missing source_url column");
  process.exit(1);
}

let warnings = 0;
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(",");
  const name = cols[nameIdx] ?? `row ${i + 1}`;
  const url = cols[urlIdx]?.trim();
  if (!url) continue;
  try {
    const u = new URL(url);
    const depth = u.pathname.replace(/\/$/, "").split("/").filter(Boolean).length;
    if (depth <= 1) {
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

if (warnings === 0) {
  console.log("No source URL warnings.");
} else {
  console.log(`\n${warnings} warning(s). Replace with article-level links before publishing.`);
  process.exit(2);
}
