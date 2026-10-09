/** Stable reference for SSG/prerender (contract remaining value, expiry flags). */
export const WAGE_REFERENCE_ISO =
  process.env.NEXT_PUBLIC_WAGE_REFERENCE_DATE ?? "2025-10-01";

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

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
  const end = new Date(contractEnd);
  if (end <= asOf) return 0;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeks = Math.ceil((end.getTime() - asOf.getTime()) / msPerWeek);
  return weeks * weeklyWage;
}

export function monthsUntil(
  iso: string | null | undefined,
  asOf: Date = referenceDate(),
): number | null {
  if (!iso) return null;
  const end = new Date(iso);
  const now = asOf;
  const months =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth());
  return months;
}
