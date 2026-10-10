import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ContractTimingBadge } from "@/components/ContractTimingBadge";
import { PageHeader } from "@/components/PageHeader";
import { StateMessage } from "@/components/StateMessage";
import { WageStatusBadge } from "@/components/WageStatusBadge";
import { pageTitleFull } from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";
import {
  isExpiringWithin12Months,
  isRecentlyExpiredNeedsVerification,
} from "@/lib/contract-timing";
import { formatDate, formatMoney, formatUsdEquivalent } from "@/lib/format";
import { getSalaryTableRows } from "@/lib/queries/get-salary-table";
import { sortSalaryRows } from "@/lib/sort-salary-rows";
import type { SalaryTableRow } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contracts Expiring Soon",
  description:
    "Football contracts ending in the next 12 months, plus recently expired deals that may need verification.",
  openGraph: {
    title: pageTitleFull("Contracts Expiring Soon"),
    description:
      "Track expiring and recently expired player contracts with cited wage figures.",
    url: siteUrl("/expiring"),
  },
  twitter: {
    card: "summary",
    title: pageTitleFull("Contracts Expiring Soon"),
    description:
      "Expiring deals in the next year and recently expired contracts to verify.",
  },
};

function ContractRow({ row }: { row: SalaryTableRow }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
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
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {row.status ? <WageStatusBadge status={row.status} /> : null}
          <ContractTimingBadge contractEnd={row.contractEnd} />
        </div>
      </div>
      <div className="text-right tabular-nums">
        <p className="font-semibold">
          {formatMoney(row.weeklyWageGbp, row.currency)}/wk
        </p>
        {formatUsdEquivalent(row.weeklyWageGbp, row.currency) ? (
          <p className="text-xs text-zinc-500">
            {formatUsdEquivalent(row.weeklyWageGbp, row.currency)}/wk
          </p>
        ) : null}
        <p className="text-sm text-zinc-500">
          {formatMoney(row.annualWageGbp, row.currency)}/yr
        </p>
      </div>
    </li>
  );
}

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
    result.rows.filter((r) => isExpiringWithin12Months(r.contractEnd)),
    "contract_end",
    "asc",
  );

  const recentlyExpired = sortSalaryRows(
    result.rows.filter((r) => isRecentlyExpiredNeedsVerification(r.contractEnd)),
    "contract_end",
    "desc",
  );

  if (expiring.length === 0 && recentlyExpired.length === 0) {
    return (
      <StateMessage
        title="No expiring deals on file"
        message="When players have contract end dates within 12 months, they will appear here."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Expiring in the next 12 months</h2>
        {expiring.length === 0 ? (
          <p className="text-sm text-zinc-500">No deals in this window on file.</p>
        ) : (
          <ul className="divide-y rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {expiring.map((row) => (
              <ContractRow key={row.playerId} row={row} />
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Recently expired, needs verification
        </h2>
        <p className="text-sm text-zinc-500">
          End dates in the past 12 months — contract may have been renewed.
        </p>
        {recentlyExpired.length === 0 ? (
          <p className="text-sm text-zinc-500">None on file in this window.</p>
        ) : (
          <ul className="divide-y rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {recentlyExpired.map((row) => (
              <ContractRow key={row.playerId} row={row} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function ExpiringPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts expiring soon"
        subtitle="Based on today's date. Expiring deals end within the next 12 months; recently expired rows may need a source refresh."
        breadcrumbs={[{ label: "Salaries", href: "/" }, { label: "Expiring" }]}
        meta={
          <Link
            href="/?sort=contract_end&dir=asc"
            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            View full table sorted by contract end →
          </Link>
        }
      />
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
