#!/usr/bin/env node
/**
 * Upsert clubs from data/clubs.csv (or path argument).
 * Usage: node scripts/import-clubs.mjs [path/to/clubs.csv]
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdminConfig, parseCsv } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2] ?? path.join(root, "data/clubs.csv");

if (!fs.existsSync(file)) {
  console.error("File not found:", file);
  process.exit(1);
}

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);
const { records } = parseCsv(fs.readFileSync(file, "utf8"));

let ok = 0;
for (const r of records) {
  if (!r.name || !r.slug) continue;
  const { error } = await supabase
    .from("clubs")
    .upsert({ name: r.name, slug: r.slug }, { onConflict: "slug" });
  if (error) {
    console.error("Failed", r.slug, error.message);
  } else {
    ok++;
    console.log("Club", r.slug);
  }
}

console.log(`Done. ${ok} clubs upserted.`);
