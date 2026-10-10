import type { SeasonStats } from "@/lib/types";

export function seasonStatsHasFigures(stats: SeasonStats): boolean {
  return (
    stats.appearances != null ||
    stats.goals != null ||
    stats.assists != null ||
    stats.minutes != null
  );
}
