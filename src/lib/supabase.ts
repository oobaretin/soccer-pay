import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const PLACEHOLDER_PATTERN =
  /your-project|your-anon|\[YOUR-DB-PASSWORD\]|\[ref\]|\[region\]/i;

export function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || PLACEHOLDER_PATTERN.test(url + key)) return null;
  return createClient(url, key);
}

export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const hasEnvLocal = fs.existsSync(envLocalPath);

  if (!hasEnvLocal) {
    return "No .env.local file found. Run npm run setup, then add your Supabase URL and anon key.";
  }

  if (!url || !key) {
    return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";
  }

  if (/your-project-id/i.test(url ?? "")) {
    return "NEXT_PUBLIC_SUPABASE_URL still uses the example your-project-id. Paste your Project URL from Supabase → Settings → API, save .env.local, then restart npm run dev.";
  }
  if (
    PLACEHOLDER_PATTERN.test(url ?? "") ||
    PLACEHOLDER_PATTERN.test(key ?? "") ||
    key === "your-anon-key" ||
    (key && !key.startsWith("eyJ"))
  ) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY must be the full anon public key (long JWT starting with eyJ), not the example text. Save .env.local and restart npm run dev.";
  }

  return null;
}
