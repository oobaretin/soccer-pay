import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { pageTitleFull, SITE_TAGLINE } from "@/lib/brand";
import { getLeagues } from "@/lib/queries/get-leagues";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Leagues",
  description: `Browse football salaries by league. ${SITE_TAGLINE}`,
  openGraph: {
    title: pageTitleFull("Leagues"),
    description: "Salary tables for each league on FB Salaries.",
    url: siteUrl("/leagues"),
  },
};

export default async function LeaguesIndexPage() {
  const [leagues, table] = await Promise.all([
    getLeagues(),
    getSalaryTableRows(),
  ]);

  const countByLeague = new Map<string, number>();
  if (table.ok) {
    for (const row of table.rows) {
      if (!row.leagueSlug) continue;
      countByLeague.set(
        row.leagueSlug,
        (countByLeague.get(row.leagueSlug) ?? 0) + 1,
      );
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leagues"
        subtitle={SITE_TAGLINE}
        hint="Open a league to filter the salary table and see top earners on file."
        breadcrumbs={[{ label: "Salaries", href: "/" }, { label: "Leagues" }]}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leagues.map((league) => (
          <li key={league.id}>
            <Link
              href={`/leagues/${league.slug}`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-600/40 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {league.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {countByLeague.get(league.slug) ?? 0} players with wages on file
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
