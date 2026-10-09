import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";
import { SalaryTable } from "@/components/SalaryTable";
import { StateMessage } from "@/components/StateMessage";
import { formatMoney, formatUsdEquivalent } from "@/lib/format";
import { getLeagues } from "@/lib/queries/get-leagues";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { sortSalaryRows } from "@/lib/sort-salary-rows";
import { DEFAULT_TITLE, SITE_TAGLINE } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import type { League } from "@/lib/types";

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: `${SITE_TAGLINE} Sortable wages across top leagues with sources and contract tracking.`,
  openGraph: {
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
  },
};

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-10 max-w-md animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-2 md:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          />
        ))}
      </div>
      <div className="hidden h-72 animate-pulse rounded-xl border border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-950" />
    </div>
  );
}

function LeagueChips({
  leagues,
  active,
}: {
  leagues: League[];
  active?: string;
}) {
  const chip = (key: string, href: string, label: string, on: boolean) => (
    <Link
      key={key}
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
        on
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Leagues">
      {chip("all", "/", "All leagues", !active)}
      {leagues.map((league) =>
        chip(
          league.slug,
          `/?league=${league.slug}`,
          league.name,
          active === league.slug,
        ),
      )}
    </nav>
  );
}

function TopEarnerCallout({
  name,
  slug,
  annual,
  currency,
}: {
  name: string;
  slug: string;
  annual: number | null;
  currency: string;
}) {
  if (annual == null) return null;
  return (
    <p className="rounded-lg border border-emerald-900/10 bg-emerald-50/80 px-4 py-3 text-sm text-zinc-800 dark:bg-emerald-950/20 dark:text-zinc-200">
      Highest annual wage on file:{" "}
      <Link
        href={`/players/${slug}`}
        className="font-semibold text-emerald-800 hover:underline dark:text-emerald-300"
      >
        {name}
      </Link>{" "}
      at{" "}
      <span className="font-semibold tabular-nums">
        {formatMoney(annual, currency)}
      </span>
      {formatUsdEquivalent(annual, currency) ? (
        <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
          {" "}
          ({formatUsdEquivalent(annual, currency)})
        </span>
      ) : null}{" "}
      per year
    </p>
  );
}

async function SalaryTableSection({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  await connection();
  const { league } = await searchParams;
  const [result, leagues] = await Promise.all([
    getSalaryTableRows(),
    getLeagues(),
  ]);

  if (!result.ok) {
    return (
      <StateMessage
        variant="error"
        title="Could not load salaries"
        message="We couldn’t reach the database. Try again in a moment."
      />
    );
  }

  if (result.rows.length === 0) {
    return (
      <StateMessage
        title="No wage data yet"
        message="Player salaries will appear here once the dataset is published."
      />
    );
  }

  const scoped = league
    ? result.rows.filter((row) => row.leagueSlug === league)
    : result.rows;
  const top = sortSalaryRows(scoped, "annual", "desc")[0];

  return (
    <div className="space-y-4">
      <LeagueChips leagues={leagues} active={league} />
      {top ? (
        <TopEarnerCallout
          name={top.name}
          slug={top.slug}
          annual={top.annualWageGbp}
          currency={top.currency}
        />
      ) : league ? (
        <StateMessage
          title="No wages in this league yet"
          message="Clubs are listed, but player salaries for this league have not been published."
        />
      ) : null}
      <SalaryTable rows={result.rows} />
    </div>
  );
}

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Football player salaries
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{SITE_TAGLINE}</p>
        <p className="text-sm text-zinc-500">
          Search by league, then open any player for sources and contract detail.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <SalaryTableSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
