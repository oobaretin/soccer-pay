import Link from "next/link";
import { WageStatusBadge } from "@/components/WageStatusBadge";
import { formatDate, formatMoney, formatUsdEquivalent } from "@/lib/format";
import type { SalaryTableRow } from "@/lib/types";

export function ArticleRankedTable({
  rows,
  startRank = 1,
}: {
  rows: SalaryTableRow[];
  startRank?: number;
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">Ranked player wages</caption>
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th scope="col" className="px-3 py-3 font-medium sm:px-4">
              #
            </th>
            <th scope="col" className="px-3 py-3 font-medium sm:px-4">
              Player
            </th>
            <th scope="col" className="px-3 py-3 font-medium sm:px-4">
              Club
            </th>
            <th scope="col" className="px-3 py-3 text-right font-medium sm:px-4">
              Weekly
            </th>
            <th scope="col" className="px-3 py-3 text-right font-medium sm:px-4">
              Annual
            </th>
            <th scope="col" className="hidden text-right font-medium sm:table-cell sm:px-4">
              USD (approx.)
            </th>
            <th scope="col" className="hidden font-medium sm:table-cell sm:px-4">
              Contract end
            </th>
            <th scope="col" className="px-3 py-3 font-medium sm:px-4">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row, index) => {
            const rank = startRank + index;
            const usdAnnual = formatUsdEquivalent(
              row.annualWageGbp,
              row.currency,
            );
            return (
              <tr
                key={row.playerId}
                className="text-zinc-800 dark:text-zinc-200"
              >
                <td className="px-3 py-3 tabular-nums text-zinc-500 sm:px-4">
                  {rank}
                </td>
                <td className="px-3 py-3 font-medium sm:px-4">
                  <Link
                    href={`/players/${row.slug}`}
                    className="text-emerald-800 hover:underline dark:text-emerald-400"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 sm:px-4">
                  {row.clubSlug ? (
                    <Link
                      href={`/clubs/${row.clubSlug}`}
                      className="hover:text-emerald-700 dark:hover:text-emerald-400"
                    >
                      {row.clubName}
                    </Link>
                  ) : (
                    (row.clubName ?? "—")
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums sm:px-4">
                  {formatMoney(row.weeklyWageGbp, row.currency)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-semibold sm:px-4">
                  {formatMoney(row.annualWageGbp, row.currency)}
                </td>
                <td className="hidden px-3 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400 sm:table-cell sm:px-4">
                  {usdAnnual ?? "—"}
                </td>
                <td className="hidden px-3 py-3 sm:table-cell sm:px-4">
                  {formatDate(row.contractEnd)}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  {row.status ? (
                    <WageStatusBadge status={row.status} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
