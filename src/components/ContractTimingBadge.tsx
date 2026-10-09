import { getContractTiming } from "@/lib/contract-timing";

export function ContractTimingBadge({
  contractEnd,
}: {
  contractEnd: string | null | undefined;
}) {
  const timing = getContractTiming(contractEnd);
  if (timing === "unknown" || timing === "active") return null;

  if (timing === "expiring") {
    return (
      <span className="ml-1.5 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-800 dark:bg-rose-950 dark:text-rose-200">
        Expiring
      </span>
    );
  }

  if (timing === "recently_expired" || timing === "expired") {
    return (
      <span className="ml-1.5 inline-block rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        Expired / verify
      </span>
    );
  }

  return null;
}

export function ContractExpiredNote({
  contractEnd,
}: {
  contractEnd: string | null | undefined;
}) {
  const timing = getContractTiming(contractEnd);
  if (timing !== "recently_expired" && timing !== "expired") return null;
  return (
    <p className="text-xs text-zinc-500 dark:text-zinc-400">
      Contract may have been renewed — end date is in the past.
    </p>
  );
}
