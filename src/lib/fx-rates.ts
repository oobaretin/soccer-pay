/** @deprecated Import from `@/lib/fx` instead. */
export {
  convertToUsd,
  FX_DISCLAIMER,
  FX_RATES_AS_OF,
  FX_USD_PER_UNIT,
  fxRatesAsOfLabel,
  sortableWageAmountUsd,
  wageForDisplay,
  type WageDisplay,
} from "@/lib/fx";

import { convertToUsd } from "@/lib/fx";

/** @deprecated Use sortableWageAmountUsd — ranking ignores display toggle. */
export function sortableWageAmount(
  amount: number | null | undefined,
  fromCurrency: string,
  _display?: import("@/lib/fx").WageDisplay,
): number | null {
  return convertToUsd(amount, fromCurrency);
}
