import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { StateMessage } from "@/components/StateMessage";
import { WageStatusBadge } from "@/components/WageStatusBadge";
import { formatDate, formatGbp } from "@/lib/format";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { sortSalaryRows } from "@/lib/sort-salary-rows";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Contracts expiring within 12 months",
  description:
    "Players whose deals end within the next year — useful for transfer and renewal tracking.",
  openGraph: {
    title: "Expiring football contracts",
    url: `${getSiteUrl()}/expiring`,
  },
};

async function ExpiringList() {
  await connection();
  const result = await getSalaryTableRows();
  if (!result.ok) {
    return (
      <StateMessage
        variant="error"
        title="Could not load contracts"
        message="We couldn’t reach the database. Try again in a moment."
      />
    );
  }

  const expiring = sortSalaryRows(
    result.rows.filter((r) => r.contractExpiringSoon),
    "contract_end",
    "asc",
  );

  if (expiring.length === 0) {
    return (
      <StateMessage
        title="No expiring deals on file"
        message="When players have contract end dates within 12 months, they will appear here."
      />
    );
  }

  return (
    <ul className="divide-y rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {expiring.map((row) => (
        <li
          key={row.playerId}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
        >
          <div>
            <Link
              href={`/players/${row.slug}`}
              className="font-semibold text-zinc-900 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              {row.name}
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {row.clubName ?? "—"} · ends {formatDate(row.contractEnd)}
            </p>
            <div className="mt-1">
              {row.status ? <WageStatusBadge status={row.status} /> : null}
            </div>
          </div>
          <div className="text-right tabular-nums">
            <p className="font-semibold">{formatGbp(row.weeklyWageGbp)}/wk</p>
            <p className="text-sm text-zinc-500">{formatGbp(row.annualWageGbp)}/yr</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ExpiringPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Contracts expiring soon
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Deals ending within 12 months from our reference date. Figures are
          labelled by source status on each profile.
        </p>
        <Link
          href="/?sort=contract_end&dir=asc"
          className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          View full table sorted by contract end →
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        }
      >
        <ExpiringList />
      </Suspense>
    </div>
  );
}
