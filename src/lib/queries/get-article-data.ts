import type { ArticleSlug } from "@/content/article-definitions";
import { isExpiringWithin12Months } from "@/lib/contract-timing";
import { sortableWageAmountUsd } from "@/lib/fx";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { sortSalaryRows } from "@/lib/sort-salary-rows";
import type { SalaryTableRow } from "@/lib/types";

export type ArticleSection = {
  title?: string;
  leagueSlug?: string;
  rows: SalaryTableRow[];
};

export type ArticleData =
  | {
      ok: true;
      /** Newest contract reviewed_at among listed players (UTC). */
      updatedAt: string | null;
      sections: ArticleSection[];
    }
  | { ok: false; error: string };

function maxReviewedAt(rows: SalaryTableRow[]): string | null {
  let max: string | null = null;
  for (const row of rows) {
    const r = row.reviewedAt;
    if (!r) continue;
    if (!max || r > max) max = r;
  }
  return max;
}

function topByAnnualUsd(rows: SalaryTableRow[], limit: number): SalaryTableRow[] {
  return sortSalaryRows(rows, "annual", "desc").slice(0, limit);
}

function topEarnerPerClub(
  rows: SalaryTableRow[],
  leagueSlug: string,
): SalaryTableRow[] {
  const inLeague = rows.filter((r) => r.leagueSlug === leagueSlug);
  const byClub = new Map<string, SalaryTableRow>();
  for (const row of inLeague) {
    const key = row.clubSlug ?? row.clubName ?? row.playerId;
    const existing = byClub.get(key);
    if (!existing) {
      byClub.set(key, row);
      continue;
    }
    const a =
      sortableWageAmountUsd(row.annualWageGbp, row.currency) ?? -1;
    const b =
      sortableWageAmountUsd(existing.annualWageGbp, existing.currency) ?? -1;
    if (a > b) byClub.set(key, row);
  }
  return sortSalaryRows([...byClub.values()], "annual", "desc");
}

export async function getArticleData(slug: ArticleSlug): Promise<ArticleData> {
  const result = await getSalaryTableRows();
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const rows = result.rows;

  switch (slug) {
    case "highest-paid-football-players-2026": {
      const listed = topByAnnualUsd(rows, 20);
      return {
        ok: true,
        updatedAt: maxReviewedAt(listed),
        sections: [{ rows: listed }],
      };
    }
    case "highest-paid-premier-league-players": {
      const pl = rows.filter((r) => r.leagueSlug === "premier-league");
      const listed = topByAnnualUsd(pl, 20);
      return {
        ok: true,
        updatedAt: maxReviewedAt(listed),
        sections: [{ rows: listed }],
      };
    }
    case "highest-paid-players-by-league": {
      const leagueSlugs = [
        ...new Set(rows.map((r) => r.leagueSlug).filter(Boolean)),
      ] as string[];
      leagueSlugs.sort((a, b) => {
        const nameA = rows.find((r) => r.leagueSlug === a)?.leagueName ?? a;
        const nameB = rows.find((r) => r.leagueSlug === b)?.leagueName ?? b;
        return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
      });

      const sections: ArticleSection[] = [];
      const allListed: SalaryTableRow[] = [];
      for (const leagueSlug of leagueSlugs) {
        const inLeague = rows.filter((r) => r.leagueSlug === leagueSlug);
        const listed = topByAnnualUsd(inLeague, 5);
        if (!listed.length) continue;
        allListed.push(...listed);
        sections.push({
          title: listed[0]?.leagueName ?? leagueSlug,
          leagueSlug,
          rows: listed,
        });
      }
      return {
        ok: true,
        updatedAt: maxReviewedAt(allListed),
        sections,
      };
    }
    case "contracts-expiring-2027": {
      const expiring = rows.filter((r) =>
        isExpiringWithin12Months(r.contractEnd),
      );
      const listed = sortSalaryRows(expiring, "contract_end", "asc");
      return {
        ok: true,
        updatedAt: maxReviewedAt(listed),
        sections: [{ rows: listed }],
      };
    }
    case "highest-paid-player-at-every-premier-league-club": {
      const listed = topEarnerPerClub(rows, "premier-league");
      return {
        ok: true,
        updatedAt: maxReviewedAt(listed),
        sections: [{ rows: listed }],
      };
    }
    default:
      return { ok: false, error: "Unknown article." };
  }
}

/** Index card preview: last updated without loading full sections when possible. */
export async function getArticlePreview(slug: ArticleSlug): Promise<{
  updatedAt: string | null;
  rowCount: number;
}> {
  const data = await getArticleData(slug);
  if (!data.ok) return { updatedAt: null, rowCount: 0 };
  const rowCount = data.sections.reduce((n, s) => n + s.rows.length, 0);
  return { updatedAt: data.updatedAt, rowCount };
}
