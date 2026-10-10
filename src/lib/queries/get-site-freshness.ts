import { getSalaryTableRows } from "@/lib/queries/get-salary-table";

/** Latest contract review date across published wages (for site freshness). */
export async function getSiteLastReviewed(): Promise<string | null> {
  const result = await getSalaryTableRows();
  if (!result.ok) return null;

  let max: string | null = null;
  for (const row of result.rows) {
    const r = row.reviewedAt;
    if (!r) continue;
    if (!max || r > max) max = r;
  }
  return max;
}
