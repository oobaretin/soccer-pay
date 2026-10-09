/** Fixed USD conversion rates for cross-league ranking (not live FX). */
export const FX_RATES_AS_OF = "2026-10-09";

export type WageDisplay = "native" | "usd";

export const FX_USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  GBP: 1.27,
  EUR: 1.1,
  SAR: 0.267,
  QAR: 0.274,
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
  return FX_USD_PER_UNIT[code] ?? null;
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

/** Ranking always uses USD-equivalent wages. */
export function sortableWageAmountUsd(
  amount: number | null | undefined,
  fromCurrency: string,
): number | null {
  return convertToUsd(amount, fromCurrency);
}

export function fxRatesAsOfLabel(): string {
  return new Date(`${FX_RATES_AS_OF}T12:00:00.000Z`).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  );
}

export const FX_DISCLAIMER =
  "USD approximations use fixed reference exchange rates for comparison only, not live market prices.";
