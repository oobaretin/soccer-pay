#!/usr/bin/env node
/**
 * Simulates Vercel build-time slug fetch (no .env.local file).
 * Writes NDJSON to .cursor/debug-e51495.log — do not log secrets.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, ".cursor/debug-e51495.log");

function agentLog(hypothesisId, message, data) {
  const line = JSON.stringify({
    sessionId: "e51495",
    runId: process.env.DEBUG_RUN_ID ?? "probe",
    hypothesisId,
    location: "scripts/debug-vercel-build-slugs.mjs",
    message,
    data,
    timestamp: Date.now(),
  });
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${line}\n`);
}

/** Logic from commit 2329b19 (broken on Vercel). */
function oldGetSupabaseConfigError(cwd) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasEnvLocal = fs.existsSync(path.join(cwd, ".env.local"));
  if (!hasEnvLocal) {
    return "No .env.local file found.";
  }
  if (!url || !key) return "missing url or key";
  return null;
}

function envSnapshot() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return {
    hasEnvLocal: fs.existsSync(path.join(root, ".env.local")),
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlHost: url ? new URL(url).host : null,
    keyShape: key ? (key.startsWith("eyJ") ? "jwt" : "invalid") : "missing",
    keyLen: key ? key.length : 0,
  };
}

function loadEnvLocalIntoProcess() {
  const p = path.join(root, ".env.local");
  if (!fs.existsSync(p)) return false;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return true;
}

async function fetchClubCount() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: "no_client", count: 0 };
  const supabase = createClient(url, key);
  const { data, error, count } = await supabase
    .from("clubs")
    .select("slug", { count: "exact", head: true });
  if (error) return { error: error.message, count: 0 };
  return { error: null, count: count ?? data?.length ?? 0 };
}

async function main() {
  const mode = process.argv[2] ?? "vercel-sim";

  agentLog("H2", "probe start", { mode, ...envSnapshot() });

  if (mode === "vercel-sim") {
    loadEnvLocalIntoProcess();
    const envLocalBackup = path.join(root, ".env.local");
    const hadFile = fs.existsSync(envLocalBackup);
    if (hadFile) fs.renameSync(envLocalBackup, `${envLocalBackup}.debug-bak`);
    try {
      const snap = envSnapshot();
      agentLog("H1", "after hide .env.local", snap);
      const oldErr = oldGetSupabaseConfigError(root);
      agentLog("H1", "old getSupabaseConfigError (2329b19)", {
        blocksSlugs: oldErr != null,
        errorPreview: oldErr?.slice(0, 80) ?? null,
      });
      const newValid =
        snap.hasUrl &&
        snap.hasKey &&
        snap.keyShape === "jwt";
      const newBlocksSlugs = newValid ? false : !snap.hasUrl || !snap.hasKey;
      agentLog("H5", "new-style env valid without file", { newValid, newBlocksSlugs });
      if (oldErr && newValid) {
        agentLog("H1", "root cause candidate", {
          detail: "env vars present but old code requires .env.local",
        });
      }
      if (!snap.hasUrl || !snap.hasKey) {
        agentLog("H2", "missing Vercel env vars", {
          hasUrl: snap.hasUrl,
          hasKey: snap.hasKey,
        });
      }
      const clubs = await fetchClubCount();
      agentLog("H4", "supabase clubs head count", clubs);
    } finally {
      if (hadFile && !fs.existsSync(envLocalBackup)) {
        fs.renameSync(`${envLocalBackup}.debug-bak`, envLocalBackup);
      }
    }
  }

  agentLog("H3", "probe end", envSnapshot());
}

main().catch((e) => {
  agentLog("H5", "probe threw", { message: String(e.message ?? e) });
  process.exit(1);
});
