import type { WageStatus } from "@/lib/types";

const styles: Record<WageStatus, string> = {
  verified:
    "bg-emerald-500/15 text-emerald-800 ring-emerald-600/30 dark:text-emerald-300",
  reported:
    "bg-amber-500/15 text-amber-900 ring-amber-600/30 dark:text-amber-200",
  estimated:
    "bg-slate-500/15 text-slate-700 ring-slate-500/30 dark:text-slate-300",
};

const labels: Record<WageStatus, string> = {
  verified: "Verified",
  reported: "Reported",
  estimated: "Estimated",
};

export function WageStatusBadge({ status }: { status: WageStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
