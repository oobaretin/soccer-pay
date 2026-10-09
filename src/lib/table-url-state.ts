import type { TableSortKey } from "@/lib/types";
import type { TableSortDir } from "@/lib/sort-salary-rows";

export type PayPeriod = "weekly" | "annual";

const SORT_KEYS: TableSortKey[] = [
  "name",
  "club",
  "position",
  "weekly",
  "annual",
  "contract_end",
  "status",
];

export function parseSortKey(raw: string | null): TableSortKey {
  if (raw && SORT_KEYS.includes(raw as TableSortKey)) {
    return raw as TableSortKey;
  }
  return "annual";
}

export function parseSortDir(raw: string | null): TableSortDir {
  return raw === "asc" ? "asc" : "desc";
}

export function parsePayPeriod(raw: string | null): PayPeriod {
  return raw === "weekly" ? "weekly" : "annual";
}
