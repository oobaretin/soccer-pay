import type { Contract } from "@/lib/types";

export function latestContract(contracts: Contract[]): Contract | null {
  if (!contracts.length) return null;
  return [...contracts].sort((a, b) => {
    const reviewed = (b.reviewed_at ?? "").localeCompare(a.reviewed_at ?? "");
    if (reviewed !== 0) return reviewed;
    return (b.contract_end ?? "").localeCompare(a.contract_end ?? "");
  })[0];
}

export function sortContractsNewestFirst(contracts: Contract[]): Contract[] {
  return [...contracts].sort((a, b) => {
    const reviewed = (b.reviewed_at ?? "").localeCompare(a.reviewed_at ?? "");
    if (reviewed !== 0) return reviewed;
    return (b.contract_end ?? "").localeCompare(a.contract_end ?? "");
  });
}
