import {
  convertToUsd,
  type WageDisplay,
  wageForDisplay,
} from "@/lib/fx";

export type { WageDisplay };
export { FX_DISCLAIMER, fxRatesAsOfLabel, FX_RATES_AS_OF } from "@/lib/fx";

/** Stable reference for SSG/prerender (contract remaining value). */
export const WAGE_REFERENCE_ISO =
  process.env.NEXT_PUBLIC_WAGE_REFERENCE_DATE ?? "2026-10-09";

function referenceDate(): Date {
  return new Date(`${WAGE_REFERENCE_ISO}T12:00:00.000Z`);
}

const formatters = new Map<string, Intl.NumberFormat>();

function moneyFormatter(currency: string): Intl.NumberFormat {
  const code = currency || "GBP";
  let fmt = formatters.get(code);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    });
    formatters.set(code, fmt);
  }
  return fmt;
}

export function formatMoney(
  amount: number | null | undefined,
  currency = "GBP",
): string {
  if (amount == null) return "—";
  try {
    return moneyFormatter(currency).format(amount);
  } catch {
    return moneyFormatter("GBP").format(amount);
  }
}

export function formatGbp(amount: number | null | undefined): string {
  return formatMoney(amount, "GBP");
}

const compactPrefix: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
  SAR: "SAR ",
  TRY: "₺",
};

/** Shorter figures for dense mobile rows (e.g. £375k, €19.5m). */
export function formatUsdEquivalent(
  amount: number | null | undefined,
  fromCurrency: string,
): string | null {
  if (amount == null) return null;
  const code = (fromCurrency || "GBP").toUpperCase();
  if (code === "USD") return null;
  const usd = convertToUsd(amount, code);
  if (usd == null) return null;
  return `≈ ${formatMoney(usd, "USD")}`;
}

export function formatWageCompact(
  amount: number | null | undefined,
  fromCurrency: string,
  display: WageDisplay = "native",
): string {
  const { amount: value, currency } = wageForDisplay(
    amount,
    fromCurrency,
    display,
  );
  return formatGbpCompact(value, currency);
}

export function formatWageMoney(
  amount: number | null | undefined,
  fromCurrency: string,
  display: WageDisplay = "native",
): string {
  const { amount: value, currency } = wageForDisplay(
    amount,
    fromCurrency,
    display,
  );
  return formatMoney(value, currency);
}

export function formatGbpCompact(
  amount: number | null | undefined,
  currency = "GBP",
): string {
  if (amount == null) return "—";
  const prefix = compactPrefix[currency] ?? `${currency} `;
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const m = amount / 1_000_000;
    const rounded = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10;
    return `${prefix}${rounded}m`;
  }
  if (abs >= 10_000) {
    return `${prefix}${Math.round(amount / 1_000)}k`;
  }
  return formatMoney(amount, currency);
}

/** Calendar date from ISO date or timestamp, interpreted in UTC. */
export function parseIsoDateUtc(iso: string): Date {
  const day = iso.slice(0, 10);
  return new Date(`${day}T12:00:00.000Z`);
}

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return parseIsoDateUtc(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatPerMetric(
  annualWage: number | null | undefined,
  count: number | null | undefined,
  label: string,
  currency = "GBP",
): string {
  if (annualWage == null || !count || count <= 0) return "—";
  return `${formatMoney(Math.round(annualWage / count), currency)} / ${label}`;
}

/** Weeks remaining × weekly wage (approximate remaining contract value). */
export function remainingContractValueGbp(
  weeklyWage: number | null | undefined,
  contractEnd: string | null | undefined,
  asOf: Date = referenceDate(),
): number | null {
  if (weeklyWage == null || !contractEnd) return null;
  const end = parseIsoDateUtc(contractEnd);
  const today = startOfUtcDay(asOf);
  if (end <= today) return 0;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeks = Math.ceil((end.getTime() - today.getTime()) / msPerWeek);
  return weeks * weeklyWage;
}

export function monthsUntil(
  iso: string | null | undefined,
  asOf: Date = referenceDate(),
): number | null {
  if (!iso) return null;
  const end = startOfUtcDay(parseIsoDateUtc(iso));
  const now = startOfUtcDay(asOf);
  const months =
    (end.getUTCFullYear() - now.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - now.getUTCMonth());
  return months;
}
