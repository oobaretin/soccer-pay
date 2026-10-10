import { formatMoney } from "@/lib/format";
import type { PlayerDetail } from "@/lib/types";

function wageCurrency(detail: PlayerDetail) {
  return (
    detail.contract?.currency?.toUpperCase() ??
    detail.club?.league?.currency?.toUpperCase() ??
    "GBP"
  );
}

export function CompareSummary({
  left,
  right,
}: {
  left: PlayerDetail;
  right: PlayerDetail;
}) {
  const leftAnnual = left.contract?.annual_wage_gbp;
  const rightAnnual = right.contract?.annual_wage_gbp;
  if (leftAnnual == null || rightAnnual == null) return null;

  const diff = Math.abs(leftAnnual - rightAnnual);
  const higher =
    leftAnnual >= rightAnnual ? left.player.name : right.player.name;
  const lower =
    leftAnnual >= rightAnnual ? right.player.name : left.player.name;
  const currency =
    leftAnnual >= rightAnnual
      ? wageCurrency(left)
      : wageCurrency(right);

  if (diff === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
        Same annual wage on file for both players (
        {formatMoney(leftAnnual, wageCurrency(left))}).
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-emerald-900/10 bg-emerald-50/80 px-4 py-3 text-sm text-zinc-800 dark:bg-emerald-950/20 dark:text-zinc-200">
      <span className="font-semibold">{higher}</span> earns{" "}
      <span className="font-semibold tabular-nums">
        {formatMoney(diff, currency)}
      </span>{" "}
      more per year than <span className="font-semibold">{lower}</span> on our
      latest contract figures.
    </p>
  );
}
