import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { formatMoney } from "@/lib/format";
import { pageTitleFull, SITE_TAGLINE } from "@/lib/brand";
import { getLeagueSummaries } from "@/lib/queries/get-league-summaries";
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
  const summaries = await getLeagueSummaries();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leagues"
        subtitle={SITE_TAGLINE}
        hint="Each league links to a filtered salary table, club list, and top earners on file."
        breadcrumbs={[{ label: "Salaries", href: "/" }, { label: "Leagues" }]}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((league) => (
          <li key={league.id}>
            <Link
              href={`/leagues/${league.slug}`}
              className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-600/40 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {league.name}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {league.country}
                {league.currency ? ` · ${league.currency}` : ""}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-zinc-500">Players</dt>
                  <dd className="font-medium tabular-nums">
                    {league.playerCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Clubs</dt>
                  <dd className="font-medium tabular-nums">{league.clubCount}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-zinc-500">Annual wages on file</dt>
                  <dd className="font-medium tabular-nums">
                    {league.annualBill > 0
                      ? formatMoney(league.annualBill, league.currency)
                      : "—"}
                  </dd>
                </div>
              </dl>
              {league.topEarner ? (
                <p className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                  Top earner:{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">
                    {league.topEarner.name}
                  </span>{" "}
                  (
                  {formatMoney(
                    league.topEarner.annual,
                    league.topEarner.currency,
                  )}
                  /yr)
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
