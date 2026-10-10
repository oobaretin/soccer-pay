import { getAllClubs } from "@/lib/queries/get-clubs";
import { getLeagues } from "@/lib/queries/get-leagues";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { sortSalaryRows } from "@/lib/sort-salary-rows";
import type { League } from "@/lib/types";

export type LeagueSummary = League & {
  playerCount: number;
  clubCount: number;
  annualBill: number;
  topEarner: {
    name: string;
    slug: string;
    annual: number;
    currency: string;
  } | null;
};

export async function getLeagueSummaries(): Promise<LeagueSummary[]> {
  const [leagues, table, clubs] = await Promise.all([
    getLeagues(),
    getSalaryTableRows(),
    getAllClubs(),
  ]);

  const countByLeague = new Map<string, number>();
  const billByLeague = new Map<string, number>();
  const topByLeague = new Map<
    string,
    { name: string; slug: string; annual: number; currency: string }
  >();

  if (table.ok) {
    for (const row of table.rows) {
      if (!row.leagueSlug) continue;
      countByLeague.set(
        row.leagueSlug,
        (countByLeague.get(row.leagueSlug) ?? 0) + 1,
      );
      billByLeague.set(
        row.leagueSlug,
        (billByLeague.get(row.leagueSlug) ?? 0) + (row.annualWageGbp ?? 0),
      );
    }
    for (const league of leagues) {
      const scoped = table.rows.filter((r) => r.leagueSlug === league.slug);
      const top = sortSalaryRows(scoped, "annual", "desc")[0];
      if (top?.annualWageGbp != null) {
        topByLeague.set(league.slug, {
          name: top.name,
          slug: top.slug,
          annual: top.annualWageGbp,
          currency: top.currency,
        });
      }
    }
  }

  const clubCountByLeague = new Map<string, number>();
  for (const club of clubs) {
    const slug = club.league?.slug;
    if (!slug) continue;
    clubCountByLeague.set(slug, (clubCountByLeague.get(slug) ?? 0) + 1);
  }

  return leagues
    .map((league) => ({
      ...league,
      playerCount: countByLeague.get(league.slug) ?? 0,
      clubCount: clubCountByLeague.get(league.slug) ?? 0,
      annualBill: billByLeague.get(league.slug) ?? 0,
      topEarner: topByLeague.get(league.slug) ?? null,
    }))
    .sort((a, b) => b.playerCount - a.playerCount || a.name.localeCompare(b.name));
}
