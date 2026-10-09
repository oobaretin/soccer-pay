import type { SalaryTableRow, TableSortKey } from "@/lib/types";

export type TableSortDir = "asc" | "desc";

function compareStrings(a: string | null, b: string | null): number {
  return (a ?? "").localeCompare(b ?? "", undefined, { sensitivity: "base" });
}

function compareNumbers(a: number | null, b: number | null): number {
  return (a ?? -1) - (b ?? -1);
}

export function sortSalaryRows(
  rows: SalaryTableRow[],
  key: TableSortKey,
  dir: TableSortDir,
): SalaryTableRow[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = compareStrings(a.name, b.name);
        break;
      case "club":
        cmp = compareStrings(a.clubName, b.clubName);
        break;
      case "position":
        cmp = compareStrings(a.position, b.position);
        break;
      case "weekly":
        cmp = compareNumbers(a.weeklyWageGbp, b.weeklyWageGbp);
        break;
      case "annual":
        cmp = compareNumbers(a.annualWageGbp, b.annualWageGbp);
        break;
      case "contract_end":
        cmp = compareStrings(a.contractEnd, b.contractEnd);
        break;
      case "status":
        cmp = compareStrings(a.status, b.status);
        break;
    }
    return cmp * mult;
  });
}

export function filterSalaryRows(
  rows: SalaryTableRow[],
  query: string,
): SalaryTableRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(q) ||
      (row.clubName?.toLowerCase().includes(q) ?? false),
  );
}
