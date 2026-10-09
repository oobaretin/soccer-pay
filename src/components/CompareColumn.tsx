import Link from "next/link";
import { SourceCitation } from "@/components/SourceCitation";
import {
  formatDate,
  formatGbp,
  formatPerMetric,
  remainingContractValueGbp,
} from "@/lib/format";
import type { PlayerDetail } from "@/lib/types";

export function CompareColumn({
  detail,
  otherName,
}: {
  detail: PlayerDetail;
  otherName: string;
}) {
  const { player, club, contract, stats } = detail;
  const remaining = remainingContractValueGbp(
    contract?.weekly_wage_gbp,
    contract?.contract_end,
  );

  return (
    <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-xl font-semibold">{player.name}</h2>
        <p className="text-sm text-zinc-500">
          vs {otherName}
          {club ? (
            <>
              {" "}
              ·{" "}
              <Link
                href={`/clubs/${club.slug}`}
                className="text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {club.name}
              </Link>
            </>
          ) : null}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <CompareRow label="Weekly" value={formatGbp(contract?.weekly_wage_gbp)} />
        <CompareRow label="Annual" value={formatGbp(contract?.annual_wage_gbp)} />
        <CompareRow
          label="Contract end"
          value={formatDate(contract?.contract_end)}
        />
        <CompareRow label="Remaining value" value={formatGbp(remaining)} />
        {stats ? (
          <>
            <CompareRow label="Goals" value={String(stats.goals ?? "—")} />
            <CompareRow label="Assists" value={String(stats.assists ?? "—")} />
            <CompareRow
              label="Wage / goal"
              value={formatPerMetric(
                contract?.annual_wage_gbp,
                stats.goals,
                "goal",
              )}
            />
            <CompareRow
              label="Wage / assist"
              value={formatPerMetric(
                contract?.annual_wage_gbp,
                stats.assists,
                "assist",
              )}
            />
          </>
        ) : null}
      </dl>
      {contract ? <SourceCitation contract={contract} /> : null}
      <Link
        href={`/players/${player.slug}`}
        className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Full profile →
      </Link>
    </article>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
