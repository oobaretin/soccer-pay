import Link from "next/link";
import { SalaryTable } from "@/components/SalaryTable";
import { LeagueChips } from "@/components/LeagueChips";
import { StateMessage } from "@/components/StateMessage";
import { formatMoney, formatUsdEquivalent } from "@/lib/format";
import { getLeagues } from "@/lib/queries/get-leagues";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { sortSalaryRows } from "@/lib/sort-salary-rows";
import type { SalaryTableRow } from "@/lib/types";

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

type Props = {
  /** When set, only rows for this league slug are shown and chips mark it active. */
  leagueSlug?: string;
  tableUrlBasePath?: string;
};

export async function LeagueSalarySection({
  leagueSlug,
  tableUrlBasePath = "/",
}: Props) {
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

  const scoped: SalaryTableRow[] = leagueSlug
    ? result.rows.filter((row) => row.leagueSlug === leagueSlug)
    : result.rows;
  const top = sortSalaryRows(scoped, "annual", "desc")[0];

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        {scoped.length} players on file
        {leagueSlug ? " in this league" : ""}
      </p>
      <LeagueChips leagues={leagues} activeSlug={leagueSlug} />
      {top ? (
        <TopEarnerCallout
          name={top.name}
          slug={top.slug}
          annual={top.annualWageGbp}
          currency={top.currency}
        />
      ) : leagueSlug ? (
        <StateMessage
          title="No wages in this league yet"
          message="Clubs are listed, but player salaries for this league have not been published."
        />
      ) : null}
      <SalaryTable rows={scoped} urlBasePath={tableUrlBasePath} />
    </div>
  );
}
