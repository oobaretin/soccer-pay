#!/usr/bin/env node
/** Apply one SQL file. Usage: node scripts/apply-one-sql.mjs scripts/migrate-leagues.sql */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { loadEnvLocal } from "./lib/load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal();
const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-one-sql.mjs <file.sql>");
  process.exit(1);
}

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl || /\[|\]/.test(dbUrl)) {
  console.error(
    "SUPABASE_DB_URL is missing or still a placeholder (it contains [ ]). Paste the real Database URI, or run scripts/migrate-leagues.sql in the Supabase SQL editor.",
  );
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(root, file), "utf8");
const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Applied", file);
} catch (err) {
  console.error("SQL failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
