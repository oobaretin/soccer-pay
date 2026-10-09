import { loadRoster } from "@/lib/queries/load-roster";

export type SlugLastModified = { slug: string; lastModified: Date | null };

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function maxDate(a: Date | null, b: Date | null): Date | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

export async function getPlayerLastModified(): Promise<SlugLastModified[]> {
  const roster = await loadRoster();
  if (!roster.ok) return [];

  return roster.rows.map((row) => ({
    slug: row.player.slug,
    lastModified: toDate(row.contract?.reviewed_at),
  }));
}

export async function getSiteContentLastModified(): Promise<Date | null> {
  const roster = await loadRoster();
  if (!roster.ok) return null;

  let max: Date | null = null;
  for (const row of roster.rows) {
    if (row.contract?.reviewed_at) {
      max = maxDate(max, toDate(row.contract.reviewed_at));
    }
  }
  return max;
}
