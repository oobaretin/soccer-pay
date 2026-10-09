import { monthsUntil } from "@/lib/format";
import { loadRoster } from "@/lib/queries/load-roster";
import type { SalaryTableRow, WageStatus } from "@/lib/types";

export type SalaryTableResult =
  | { ok: true; rows: SalaryTableRow[] }
  | { ok: false; error: string; rows: [] };

export async function getSalaryTableRows(): Promise<SalaryTableResult> {
  const roster = await loadRoster();
  if (!roster.ok) {
    return { ok: false, error: roster.error, rows: [] };
  }

  const rows: SalaryTableRow[] = roster.rows.map((row) => {
    const months = monthsUntil(row.contract?.contract_end);
    const contractExpiringSoon =
      months != null && months >= 0 && months <= 12;

    return {
      playerId: row.player.id,
      name: row.player.name,
      slug: row.player.slug,
      photoUrl: row.player.photo_url ?? null,
      position: row.player.position,
      clubName: row.club?.name ?? null,
      clubSlug: row.club?.slug ?? null,
      leagueName: row.club?.league?.name ?? null,
      leagueSlug: row.club?.league?.slug ?? null,
      currency:
        row.contract?.currency ||
        row.club?.league?.currency ||
        "GBP",
      weeklyWageGbp: row.contract?.weekly_wage_gbp ?? null,
      annualWageGbp: row.contract?.annual_wage_gbp ?? null,
      contractEnd: row.contract?.contract_end ?? null,
      status: (row.contract?.status as WageStatus | undefined) ?? null,
      sourceName: row.contract?.source_name ?? null,
      sourceUrl: row.contract?.source_url ?? null,
      contractExpiringSoon,
    };
  });

  return { ok: true, rows };
}
