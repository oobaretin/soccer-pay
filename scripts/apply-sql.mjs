#!/usr/bin/env node
/**
 * Applies schema.sql + scripts/seed.sql (same as Supabase SQL editor).
 *
 * Requires SUPABASE_DB_URL in .env.local or env:
 *   Project Settings → Database → Connection string → URI (use database password)
 *
 * Usage: node scripts/apply-sql.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

loadEnvLocal();

const dbUrl = process.env.SUPABASE_DB_URL;
const placeholderPattern =
  /your-project|your-anon|\[YOUR-DB-PASSWORD\]|\[ref\]|\[region\]/i;

if (!dbUrl) {
  console.error(
    "Missing SUPABASE_DB_URL.\n\nAdd to .env.local:\n  SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@...supabase.com:6543/postgres\n\nFrom Supabase: Project Settings → Database → Connection string (URI).",
  );
  process.exit(1);
}

if (placeholderPattern.test(dbUrl)) {
  console.error(
    "SUPABASE_DB_URL still has placeholder text. Paste the real Database URI from Supabase → Project Settings → Database → Connection string.",
  );
  process.exit(1);
}

const schemaSql = fs.readFileSync(path.join(root, "schema.sql"), "utf8");
const seedClubsSql = fs.readFileSync(
  path.join(root, "scripts/seed-clubs.sql"),
  "utf8",
);
const seedSql = fs.readFileSync(path.join(root, "scripts/seed.sql"), "utf8");

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(schemaSql);
  await client.query(seedClubsSql);
  await client.query(seedSql);

  const { rows } = await client.query(
    "select (select count(*) from clubs) as clubs, (select count(*) from players) as players, (select count(*) from contracts) as contracts",
  );

  console.log(
    "Done. clubs:",
    rows[0].clubs,
    "players:",
    rows[0].players,
    "contracts:",
    rows[0].contracts,
  );
} catch (err) {
  console.error("SQL failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
