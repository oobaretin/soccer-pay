import {
  formatGbpCompact,
  formatMoney,
  formatUsdEquivalent,
  type WageDisplay,
} from "@/lib/format";
import { convertToUsd } from "@/lib/fx";

export function WageAmountCell({
  amount,
  currency,
  display,
  emphasized = false,
}: {
  amount: number | null | undefined;
  currency: string;
  display: WageDisplay;
  emphasized?: boolean;
}) {
  if (amount == null) {
    return <span className="text-zinc-400">—</span>;
  }

  const primaryClass = emphasized
    ? "text-base font-semibold text-zinc-900 dark:text-zinc-50"
    : "text-zinc-700 dark:text-zinc-300";

  if (display === "usd") {
    const usd = convertToUsd(amount, currency);
    const code = (currency || "GBP").toUpperCase();
    return (
      <div className="text-right tabular-nums">
        <p className={primaryClass}>{formatMoney(usd, "USD")}</p>
        {code !== "USD" ? (
          <p className="text-xs text-zinc-500">
            {formatGbpCompact(amount, currency)} local
          </p>
        ) : null}
      </div>
    );
  }

  const usdHint = formatUsdEquivalent(amount, currency);
  return (
    <div className="text-right tabular-nums">
      <p className={primaryClass}>{formatMoney(amount, currency)}</p>
      {usdHint ? <p className="text-xs text-zinc-500">{usdHint}</p> : null}
    </div>
  );
}
