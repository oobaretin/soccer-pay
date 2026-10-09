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
import type { PlayerDetail } from "@/lib/types";

export function CompareColumn({
  detail,
  otherName,
}: {
  detail: PlayerDetail;
  otherName: string;
}) {
  const { player, club, contract, stats } = detail;
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
          size="md"
        />
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
