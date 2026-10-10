import Link from "next/link";
import { PlayerPhoto } from "@/components/PlayerPhoto";
import { SourceCitation } from "@/components/SourceCitation";
import {
  formatDate,
  formatMoney,
  formatPerMetric,
  formatUsdEquivalent,
  remainingContractValueGbp,
} from "@/lib/format";
import { seasonStatsHasFigures } from "@/lib/stats-display";
import { WageStatusBadge } from "@/components/WageStatusBadge";
import { CURRENT_SEASON } from "@/lib/queries/load-roster";
import type { PlayerDetail } from "@/lib/types";

export function CompareColumn({
  detail,
  otherName,
}: {
  detail: PlayerDetail;
  otherName: string;
}) {
  const { player, club, contract, stats } = detail;
  const league = club?.league;
  const wageCurrency =
    contract?.currency?.toUpperCase() ??
    club?.league?.currency?.toUpperCase() ??
    "GBP";
  const fmt = (amount: number | null | undefined) =>
    formatMoney(amount, wageCurrency);
  const remaining = remainingContractValueGbp(
    contract?.weekly_wage_gbp,
    contract?.contract_end,
  );

  return (
    <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <PlayerPhoto
          name={player.name}
          photoUrl={player.photo_url}
          size="lg"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{player.name}</h2>
            {contract?.status ? (
              <WageStatusBadge status={contract.status} />
            ) : null}
          </div>
          <p className="text-sm text-zinc-500">
            vs {otherName}
            {player.position ? <> · {player.position}</> : null}
          </p>
          {club ? (
            <p className="text-sm text-zinc-500">
              <Link
                href={`/clubs/${club.slug}`}
                className="text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {club.name}
              </Link>
              {league ? (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href={`/leagues/${league.slug}`}
                    className="text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {league.name}
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <CompareRow
          label="Weekly"
          value={fmt(contract?.weekly_wage_gbp)}
          hint={formatUsdEquivalent(contract?.weekly_wage_gbp, wageCurrency)}
        />
        <CompareRow
          label="Annual"
          value={fmt(contract?.annual_wage_gbp)}
          hint={formatUsdEquivalent(contract?.annual_wage_gbp, wageCurrency)}
        />
        <CompareRow
          label="Contract end"
          value={formatDate(contract?.contract_end)}
        />
        <CompareRow label="Remaining value" value={fmt(remaining)} />
        {stats && seasonStatsHasFigures(stats) ? (
          <>
            <CompareRow
              label={`Apps (${CURRENT_SEASON})`}
              value={String(stats.appearances ?? "—")}
            />
            <CompareRow label="Goals" value={String(stats.goals ?? "—")} />
            <CompareRow label="Assists" value={String(stats.assists ?? "—")} />
            <CompareRow
              label="Wage / goal"
              value={formatPerMetric(
                contract?.annual_wage_gbp,
                stats.goals,
                "goal",
                wageCurrency,
              )}
            />
            <CompareRow
              label="Wage / assist"
              value={formatPerMetric(
                contract?.annual_wage_gbp,
                stats.assists,
                "assist",
                wageCurrency,
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

function CompareRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | null;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
      {hint ? (
        <dd className="text-xs tabular-nums text-zinc-500">{hint}</dd>
      ) : null}
    </div>
  );
}
