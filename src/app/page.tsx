import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";
import { SalaryTable } from "@/components/SalaryTable";
import { StateMessage } from "@/components/StateMessage";
import { formatGbp } from "@/lib/format";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { sortSalaryRows } from "@/lib/sort-salary-rows";

export const metadata: Metadata = {
  title: "Premier League player salaries 2025",
  description:
    "Sortable Premier League wages by player and club. Weekly and annual pay, contract end dates, and source status.",
  openGraph: {
    title: "Premier League player salaries",
    description:
      "Sortable Premier League wages with cited sources and contract expiry flags.",
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

function TopEarnerCallout({
  name,
  slug,
  annual,
}: {
  name: string;
  slug: string;
  annual: number | null;
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
      at <span className="font-semibold tabular-nums">{formatGbp(annual)}</span>{" "}
      per year
    </p>
  );
}

async function SalaryTableSection() {
  await connection();
  const result = await getSalaryTableRows();

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

  const top = sortSalaryRows(result.rows, "annual", "desc")[0];

  return (
    <div className="space-y-4">
      {top ? (
        <TopEarnerCallout
          name={top.name}
          slug={top.slug}
          annual={top.annualWageGbp}
        />
      ) : null}
      <SalaryTable rows={result.rows} />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Premier League player salaries
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Search, sort, and open any player for sources and contract detail.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <SalaryTableSection />
      </Suspense>
    </div>
  );
}
