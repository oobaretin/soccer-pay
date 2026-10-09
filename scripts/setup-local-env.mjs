#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const example = path.join(root, ".env.local.example");
const target = path.join(root, ".env.local");

if (fs.existsSync(target)) {
  console.log(".env.local already exists — edit it with your Supabase keys.");
  process.exit(0);
}

if (!fs.existsSync(example)) {
  console.error("Missing .env.local.example");
  process.exit(1);
}

fs.copyFileSync(example, target);
console.log("Created .env.local from .env.local.example.");
console.log("Fill in Supabase URL, anon key, and SUPABASE_DB_URL, then:");
console.log("  npm run db:apply");
console.log("  npm run dev");
