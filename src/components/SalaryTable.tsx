"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type MouseEvent } from "react";
import { formatDate, formatGbpCompact, formatMoney } from "@/lib/format";
import {
  filterSalaryRows,
  sortSalaryRows,
  type TableSortDir,
} from "@/lib/sort-salary-rows";
import {
  parsePayPeriod,
  parseSortDir,
  parseSortKey,
  type PayPeriod,
} from "@/lib/table-url-state";
import type { SalaryTableRow, TableSortKey } from "@/lib/types";
import { PlayerPhoto } from "./PlayerPhoto";
import { WageStatusBadge } from "./WageStatusBadge";

type Props = {
  rows: SalaryTableRow[];
};

const RANK_WIDTH = "w-12";

const desktopColumns: {
  key: TableSortKey | "rank";
  label: string;
  sortable: boolean;
  className?: string;
}[] = [
  { key: "rank", label: "#", sortable: false, className: RANK_WIDTH },
  { key: "name", label: "Player", sortable: true },
  { key: "club", label: "Club", sortable: true },
  { key: "position", label: "Pos", sortable: true, className: "hidden lg:table-cell" },
  {
    key: "weekly",
    label: "Weekly",
    sortable: true,
    className: "hidden md:table-cell",
  },
  { key: "annual", label: "Annual", sortable: true },
  { key: "contract_end", label: "Contract", sortable: true },
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
  const league = searchParams.get("league") ?? "";

  useEffect(() => {
    const params = new URLSearchParams();
    if (league) params.set("league", league);
    const q = query.trim();
    if (q) params.set("q", q);
    if (sortKey !== "annual") params.set("sort", sortKey);
    if (sortDir !== "desc") params.set("dir", sortDir);
    if (period !== "annual") params.set("period", period);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/?${next}` : "/", { scroll: false });
    }
  }, [query, sortKey, sortDir, period, league, router, searchParams]);

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

  const primaryAmount = (row: SalaryTableRow) =>
    period === "weekly" ? row.weeklyWageGbp : row.annualWageGbp;
  const primaryLabel = period === "weekly" ? "per week" : "per year";
  const secondaryAmount = (row: SalaryTableRow) =>
    period === "weekly" ? row.annualWageGbp : row.weeklyWageGbp;
  const secondaryLabel =
    period === "weekly" ? "per year" : "/wk";

  function goToPlayer(slug: string, e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    router.push(`/players/${slug}`);
  }

  return (
    <div className="space-y-4">
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
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 shadow-sm outline-none ring-emerald-600/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
                className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Clear search
              </button>
            </>
          ) : null}
        </p>
        <div className="flex gap-1 pt-1">
          <span className="sr-only">Show wages as</span>
          {(["annual", "weekly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPayPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
                period === p
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: card list */}
      <ul className="space-y-2 md:hidden">
        {visible.map((row, index) => (
          <li key={row.playerId}>
            <Link
              href={`/players/${row.slug}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:active:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 gap-3">
                  <PlayerPhoto
                    name={row.name}
                    photoUrl={row.photoUrl}
                    size="md"
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                  <p className="text-xs tabular-nums text-zinc-400">#{index + 1}</p>
                  <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                    {row.name}
                  </p>
                  <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                    {row.clubName ?? "—"}
                    {row.position ? ` · ${row.position}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {row.status ? <WageStatusBadge status={row.status} /> : null}
                    {row.contractExpiringSoon ? (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                        Expiring
                      </span>
                    ) : null}
                  </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatGbpCompact(primaryAmount(row), row.currency)}
                  </p>
                  <p className="text-xs text-zinc-500">{primaryLabel}</p>
                  <p className="mt-1 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatGbpCompact(secondaryAmount(row), row.currency)}
                    {period === "annual" ? "/wk" : ` ${secondaryLabel}`}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
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
          </li>
        ) : null}
      </ul>

      {/* Desktop: table */}
      <div className="relative hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                {desktopColumns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 font-medium ${col.className ?? ""} ${
                      col.key === "rank"
                        ? `sticky left-0 z-20 ${RANK_WIDTH} bg-zinc-50 dark:bg-zinc-900`
                        : col.key === "name"
                          ? "sticky left-12 z-20 min-w-[160px] bg-zinc-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] dark:bg-zinc-900 dark:shadow-[4px_0_8px_-4px_rgba(0,0,0,0.4)]"
                          : col.key === "annual" || col.key === "weekly"
                            ? "text-right"
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
                    className={`sticky left-0 z-10 ${RANK_WIDTH} bg-white px-4 py-3 tabular-nums text-zinc-500 group-hover:bg-zinc-50 dark:bg-zinc-950 dark:group-hover:bg-zinc-900/60`}
                  >
                    {index + 1}
                  </td>
                  <td className="sticky left-12 z-10 min-w-[200px] bg-white px-4 py-3 group-hover:bg-zinc-50 dark:bg-zinc-950 dark:group-hover:bg-zinc-900/60">
                    <div className="flex items-center gap-2.5">
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
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {row.status ? (
                        <WageStatusBadge status={row.status} />
                      ) : (
                        <span className="text-xs text-zinc-400">No wage on file</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {row.clubSlug && row.clubName ? (
                      <Link
                        href={`/clubs/${row.clubSlug}`}
                        className="hover:text-emerald-700 dark:hover:text-emerald-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.clubName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 lg:table-cell dark:text-zinc-400">
                    {row.position ?? "—"}
                  </td>
                  <td
                    className={`hidden px-4 py-3 text-right tabular-nums md:table-cell ${
                      period === "weekly"
                        ? "text-base font-semibold text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {formatMoney(row.weeklyWageGbp, row.currency)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${
                      period === "annual"
                        ? "text-base font-semibold text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {formatMoney(row.annualWageGbp, row.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span>{formatDate(row.contractEnd)}</span>
                    {row.contractExpiringSoon ? (
                      <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                        Expiring
                      </span>
                    ) : null}
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
        </div>
      </div>
    </div>
  );
}

export function SalaryTable(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="h-72 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />
      }
    >
      <SalaryTableInner {...props} />
    </Suspense>
  );
}
