import { parseIsoDateUtc } from "@/lib/format";

export type ContractTiming =
  | "unknown"
  | "active"
  | "expiring"
  | "expired"
  | "recently_expired";

const MS_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function parseEnd(iso: string): Date {
  return startOfUtcDay(parseIsoDateUtc(iso));
}

/** Contract timing relative to today (UTC calendar days). */
export function getContractTiming(
  contractEnd: string | null | undefined,
  asOf: Date = new Date(),
): ContractTiming {
  if (!contractEnd) return "unknown";
  const end = parseEnd(contractEnd);
  const today = startOfUtcDay(asOf);
  const days = Math.round((end.getTime() - today.getTime()) / MS_DAY);

  if (days < 0) {
    const daysAgo = -days;
    return daysAgo <= 365 ? "recently_expired" : "expired";
  }
  if (days <= 365) return "expiring";
  return "active";
}

export function isExpiringWithin12Months(
  contractEnd: string | null | undefined,
  asOf: Date = new Date(),
): boolean {
  return getContractTiming(contractEnd, asOf) === "expiring";
}

export function isRecentlyExpiredNeedsVerification(
  contractEnd: string | null | undefined,
  asOf: Date = new Date(),
): boolean {
  return getContractTiming(contractEnd, asOf) === "recently_expired";
}
