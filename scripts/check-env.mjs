#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const placeholder = /your-project|your-anon|\[YOUR-DB-PASSWORD\]|\[ref\]|\[region\]/i;

function describeUrl(value) {
  if (!value) return "MISSING";
  if (placeholder.test(value)) {
    if (/your-project-id/i.test(value)) {
      return "STILL EXAMPLE — replace your-project-id with your real project ref from the dashboard URL";
    }
    return "PLACEHOLDER text detected";
  }
  if (!/\.supabase\.co/.test(value)) return "OK length but URL should end with .supabase.co";
  return `OK (${value.length} chars)`;
}

function describeAnon(value) {
  if (!value) return "MISSING";
  if (placeholder.test(value) || value === "your-anon-key") {
    return "STILL EXAMPLE — paste the full anon public key (long string starting with eyJ, not the label your-anon-key)";
  }
  if (!value.startsWith("eyJ")) {
    return `WRONG SHAPE (${value.length} chars) — anon key should be a long JWT starting with eyJ`;
  }
  return `OK (${value.length} chars)`;
}

function describeDb(value) {
  if (!value) return "MISSING (optional if you used SQL Editor)";
  if (placeholder.test(value)) {
    return "STILL EXAMPLE — only needed for npm run db:apply";
  }
  return `OK (${value.length} chars)`;
}

if (!fs.existsSync(envPath)) {
  console.log("No .env.local — run: npm run setup");
  process.exit(1);
}

const vars = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (!m) continue;
  vars[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

console.log("NEXT_PUBLIC_SUPABASE_URL:", describeUrl(vars.NEXT_PUBLIC_SUPABASE_URL));
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  describeAnon(vars.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);
console.log("SUPABASE_DB_URL:", describeDb(vars.SUPABASE_DB_URL));

const ready =
  vars.NEXT_PUBLIC_SUPABASE_URL &&
  vars.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !placeholder.test(vars.NEXT_PUBLIC_SUPABASE_URL) &&
  vars.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith("eyJ");

const stat = fs.statSync(envPath);
console.log(`\n.env.local last saved: ${stat.mtime.toISOString()}`);
console.log(
  ready
    ? "App can load data — restart npm run dev if it was already running."
    : "If you already pasted keys in the editor, press Save (Cmd+S), run check:env again, then restart npm run dev.",
);
