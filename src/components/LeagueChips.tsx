import Link from "next/link";
import type { League } from "@/lib/types";

export function LeagueChips({
  leagues,
  activeSlug,
}: {
  leagues: League[];
  activeSlug?: string;
}) {
  const chip = (key: string, href: string, label: string, on: boolean) => (
    <Link
      key={key}
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
        on
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Leagues">
      {chip("all", "/", "All leagues", !activeSlug)}
      {leagues.map((league) =>
        chip(
          league.slug,
          `/leagues/${league.slug}`,
          league.name,
          activeSlug === league.slug,
        ),
      )}
    </nav>
  );
}
