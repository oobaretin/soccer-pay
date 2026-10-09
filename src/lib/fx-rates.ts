/** Fixed rates for approximate cross-league comparison (not live FX). */
export type WageDisplay = "native" | "usd";

const DEFAULT_FX_USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  GBP: 1.27,
  EUR: 1.1,
  SAR: 0.267,
  TRY: 0.029,
};

function rateToUsd(currency: string): number | null {
  const code = (currency || "GBP").toUpperCase();
  const fromEnv =
    code === "GBP"
      ? process.env.NEXT_PUBLIC_FX_GBP_USD
      : code === "EUR"
        ? process.env.NEXT_PUBLIC_FX_EUR_USD
        : code === "SAR"
          ? process.env.NEXT_PUBLIC_FX_SAR_USD
          : code === "TRY"
            ? process.env.NEXT_PUBLIC_FX_TRY_USD
            : undefined;
  if (fromEnv != null && fromEnv !== "") {
    const parsed = Number(fromEnv);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_FX_USD_PER_UNIT[code] ?? null;
}

export function convertToUsd(
  amount: number | null | undefined,
  fromCurrency: string,
): number | null {
  if (amount == null) return null;
  const rate = rateToUsd(fromCurrency);
  if (rate == null) return null;
  return Math.round(amount * rate);
}

export function wageForDisplay(
  amount: number | null | undefined,
  fromCurrency: string,
  display: WageDisplay,
): { amount: number | null; currency: string } {
  const native = (fromCurrency || "GBP").toUpperCase();
  if (display === "usd") {
    return { amount: convertToUsd(amount, native), currency: "USD" };
  }
  return { amount: amount ?? null, currency: native };
}

export function sortableWageAmount(
  amount: number | null | undefined,
  fromCurrency: string,
  display: WageDisplay,
): number | null {
  if (display === "usd") return convertToUsd(amount, fromCurrency);
  return amount ?? null;
}

export const FX_DISCLAIMER =
  "USD figures use fixed reference exchange rates for comparison only, not live market prices.";
