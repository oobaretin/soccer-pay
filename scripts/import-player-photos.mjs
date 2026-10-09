#!/usr/bin/env node
/**
 * Set players.photo_url from data/player-photos.csv (player_slug, photo_url).
 * Usage: node scripts/import-player-photos.mjs [path/to/player-photos.csv]
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdminConfig, parseCsv } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2] ?? path.join(root, "data/player-photos.csv");

if (!fs.existsSync(file)) {
  console.error("File not found:", file);
  process.exit(1);
}

const { url, key } = getSupabaseAdminConfig();
const supabase = createClient(url, key);
const { records } = parseCsv(fs.readFileSync(file, "utf8"));

let ok = 0;
let skip = 0;

for (const r of records) {
  if (!r.player_slug || !r.photo_url?.startsWith("http")) {
    skip++;
    continue;
  }
  const { error } = await supabase
    .from("players")
    .update({ photo_url: r.photo_url.trim() })
    .eq("slug", r.player_slug);
  if (error) {
    console.warn("Failed", r.player_slug, error.message);
    skip++;
  } else {
    ok++;
    console.log("Photo", r.player_slug);
  }
}

console.log(`Done. ${ok} updated, ${skip} skipped.`);
