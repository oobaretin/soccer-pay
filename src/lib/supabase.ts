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

function validateSupabaseEnv(
  url: string | undefined,
  key: string | undefined,
): string | null {
  if (!url || !key) {
    return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }

  if (/your-project-id/i.test(url)) {
    return "NEXT_PUBLIC_SUPABASE_URL still uses the example your-project-id. Paste your Project URL from Supabase → Settings → API.";
  }
  if (
    PLACEHOLDER_PATTERN.test(url) ||
    PLACEHOLDER_PATTERN.test(key) ||
    key === "your-anon-key" ||
    !key.startsWith("eyJ")
  ) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY must be the full anon public key (long JWT starting with eyJ), not placeholder text.";
  }

  return null;
}

/** True when URL + anon key are set (Vercel env, .env.local, etc.). */
export function hasSupabasePublicConfig(): boolean {
  return (
    validateSupabaseEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ) === null
  );
}

export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const envError = validateSupabaseEnv(url, key);
  if (!envError) return null;

  const envLocalPath = path.join(process.cwd(), ".env.local");
  const hasEnvLocal = fs.existsSync(envLocalPath);

  if (!hasEnvLocal) {
    return `${envError} Locally: run npm run setup and create .env.local. On Vercel: add both vars under Project → Settings → Environment Variables.`;
  }

  if (!url || !key) {
    return `${envError} Save them in .env.local, then restart npm run dev.`;
  }

  if (/your-project-id/i.test(url)) {
    return `${envError} Save .env.local and restart npm run dev.`;
  }

  return `${envError} Save .env.local and restart npm run dev.`;
}
