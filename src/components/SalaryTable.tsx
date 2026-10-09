"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type MouseEvent } from "react";
import { ContractTimingBadge } from "@/components/ContractTimingBadge";
import { WageAmountCell } from "@/components/WageAmountCell";
import {
  formatDate,
  fxRatesAsOfLabel,
  type WageDisplay,
} from "@/lib/format";
import { FX_DISCLAIMER } from "@/lib/fx";
import {
  filterSalaryRows,
  sortSalaryRows,
  type TableSortDir,
} from "@/lib/sort-salary-rows";
import {
  parsePayPeriod,
  parseSortDir,
  parseSortKey,
  parseWageDisplay,
  type PayPeriod,
} from "@/lib/table-url-state";
import type { SalaryTableRow, TableSortKey } from "@/lib/types";
import { PlayerPhoto } from "./PlayerPhoto";
import { WageStatusBadge } from "./WageStatusBadge";

type Props = {
  rows: SalaryTableRow[];
};

const RANK_WIDTH = "w-11 min-w-[2.75rem]";
const NAME_STICKY = "sticky left-11 z-10 min-w-[9rem] sm:min-w-[11rem]";

const columns: {
  key: TableSortKey | "rank";
  label: string;
  sortable: boolean;
  className?: string;
}[] = [
  { key: "rank", label: "#", sortable: false, className: RANK_WIDTH },
  { key: "name", label: "Player", sortable: true },
  { key: "club", label: "Club", sortable: true },
  {
    key: "weekly",
    label: "Weekly",
    sortable: true,
    className: "text-right",
  },
  { key: "annual", label: "Annual", sortable: true, className: "text-right" },
  { key: "status", label: "Status", sortable: true },
  {
    key: "position",
    label: "Pos",
    sortable: true,
    className: "hidden lg:table-cell",
  },
  {
    key: "contract_end",
    label: "Contract",
    sortable: true,
    className: "hidden sm:table-cell",
  },
];

function sortAriaValue(
  sortKey: TableSortKey,
  colKey: TableSortKey,
  sortDir: TableSortDir,
): "ascending" | "descending" | "none" {
  if (sortKey !== colKey) return "none";
  return sortDir === "asc" ? "ascending" : "descending";
}

function SalaryTableInner({ rows }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [sortKey, setSortKey] = useState<TableSortKey>(() =>
    parseSortKey(searchParams.get("sort")),
  );
  const [sortDir, setSortDir] = useState<TableSortDir>(() =>
    parseSortDir(searchParams.get("dir")),
  );
  const [period, setPeriod] = useState<PayPeriod>(() =>
    parsePayPeriod(searchParams.get("period")),
  );
  const [wageDisplay, setWageDisplay] = useState<WageDisplay>(() =>
    parseWageDisplay(searchParams.get("display")),
  );
  const league = searchParams.get("league") ?? "";

  useEffect(() => {
    const params = new URLSearchParams();
    if (league) params.set("league", league);
    const q = query.trim();
    if (q) params.set("q", q);
    if (sortKey !== "annual") params.set("sort", sortKey);
    if (sortDir !== "desc") params.set("dir", sortDir);
    if (period !== "annual") params.set("period", period);
    if (wageDisplay === "usd") params.set("display", "usd");
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/?${next}` : "/", { scroll: false });
    }
  }, [query, sortKey, sortDir, period, wageDisplay, league, router, searchParams]);

  const inLeague = useMemo(() => {
    if (!league) return rows;
    return rows.filter((row) => row.leagueSlug === league);
  }, [rows, league]);

  const visible = useMemo(() => {
    const filtered = filterSalaryRows(inLeague, query);
    return sortSalaryRows(filtered, sortKey, sortDir);
  }, [inLeague, query, sortKey, sortDir]);

  const trimmedQuery = query.trim();
  const isFiltering = trimmedQuery.length > 0;

  function onSort(key: TableSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "name" || key === "club" || key === "position" ? "asc" : "desc",
      );
    }
  }

  function setPayPeriod(next: PayPeriod) {
    setPeriod(next);
    setSortKey(next === "weekly" ? "weekly" : "annual");
    setSortDir("desc");
  }

  function goToPlayer(slug: string, e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    router.push(`/players/${slug}`);
  }

  const weeklyEmphasis = period === "weekly";
  const annualEmphasis = period === "annual";

  return (
    <div className="max-w-full space-y-4">
      <div className="max-w-md space-y-1">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            Search players or clubs
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Saka or Chelsea"
            className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 shadow-sm outline-none ring-emerald-600/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <p className="text-xs text-zinc-500">
          {isFiltering
            ? `${visible.length} of ${inLeague.length} players`
            : `${inLeague.length} players`}
          {isFiltering ? (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => setQuery("")}
                className="min-h-11 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Clear search
              </button>
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex gap-1">
            <span className="sr-only">Show wages as</span>
            {(["annual", "weekly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPayPeriod(p)}
                className={`min-h-11 rounded-md px-3 py-2 text-xs font-medium capitalize ${
                  period === p
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <span className="sr-only">Currency display</span>
            {(
              [
                ["native", "Local"],
                ["usd", "USD (approx.)"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setWageDisplay(value)}
                className={`min-h-11 rounded-md px-3 py-2 text-xs font-medium ${
                  wageDisplay === value
                    ? "bg-emerald-800 text-white dark:bg-emerald-600"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Rank uses USD-equivalent annual wage. {FX_DISCLAIMER}
        </p>
      </div>

      <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3 py-3 font-medium sm:px-4 ${col.className ?? ""} ${
                    col.key === "rank"
                      ? `sticky left-0 z-20 ${RANK_WIDTH} bg-zinc-50 dark:bg-zinc-900`
                      : col.key === "name"
                        ? `${NAME_STICKY} z-20 bg-zinc-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] dark:bg-zinc-900 dark:shadow-[4px_0_8px_-4px_rgba(0,0,0,0.4)]`
                        : ""
                  }`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key as TableSortKey)}
                      aria-sort={sortAriaValue(
                        sortKey,
                        col.key as TableSortKey,
                        sortDir,
                      )}
                      className="inline-flex min-h-11 items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-400"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>
                      ) : null}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visible.map((row, index) => (
              <tr
                key={row.playerId}
                onClick={(e) => goToPlayer(row.slug, e)}
                className="group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
              >
                <td
                  className={`sticky left-0 z-10 ${RANK_WIDTH} bg-white px-3 py-3 tabular-nums text-zinc-500 group-hover:bg-zinc-50 sm:px-4 dark:bg-zinc-950 dark:group-hover:bg-zinc-900/60`}
                >
                  {index + 1}
                </td>
                <td
                  className={`${NAME_STICKY} bg-white px-3 py-3 group-hover:bg-zinc-50 sm:px-4 dark:bg-zinc-950 dark:group-hover:bg-zinc-900/60`}
                >
                  <div className="flex min-h-11 items-center gap-2">
                    <PlayerPhoto
                      name={row.name}
                      photoUrl={row.photoUrl}
                      size="sm"
                    />
                    <Link
                      href={`/players/${row.slug}`}
                      className="font-medium text-zinc-900 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-400"
                    >
                      {row.name}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-3 text-zinc-700 sm:px-4 dark:text-zinc-300">
                  {row.clubSlug && row.clubName ? (
                    <Link
                      href={`/clubs/${row.clubSlug}`}
                      className="inline-flex min-h-11 items-center hover:text-emerald-700 dark:hover:text-emerald-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.clubName}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <WageAmountCell
                    amount={row.weeklyWageGbp}
                    currency={row.currency}
                    display={wageDisplay}
                    emphasized={weeklyEmphasis}
                  />
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <WageAmountCell
                    amount={row.annualWageGbp}
                    currency={row.currency}
                    display={wageDisplay}
                    emphasized={annualEmphasis}
                  />
                </td>
                <td className="px-3 py-3 sm:px-4">
                  {row.status ? (
                    <WageStatusBadge status={row.status} />
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-zinc-600 lg:table-cell dark:text-zinc-400">
                  {row.position ?? "—"}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span>{formatDate(row.contractEnd)}</span>
                  <ContractTimingBadge contractEnd={row.contractEnd} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            {inLeague.length === 0
              ? "No wages published for this league yet."
              : (
                <>
                  No players match &ldquo;{trimmedQuery}&rdquo;.{" "}
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="font-medium text-emerald-700 dark:text-emerald-400"
                  >
                    Clear search
                  </button>
                </>
              )}
          </p>
        ) : null}
        <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800">
          Rates as of {fxRatesAsOfLabel()} · Ranking uses USD-equivalent wages
        </p>
      </div>
    </div>
  );
}

export function SalaryTable(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="h-72 max-w-full animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />
      }
    >
      <SalaryTableInner {...props} />
    </Suspense>
  );
}
