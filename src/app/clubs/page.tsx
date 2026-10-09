import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { StateMessage } from "@/components/StateMessage";
import { getAllClubs } from "@/lib/queries/get-clubs";
import { loadRoster } from "@/lib/queries/load-roster";
import { formatMoney } from "@/lib/format";

import { pageTitleFull } from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Club Wage Bills",
  description:
    "Football club wage bills and squad salaries on file, grouped by league.",
  openGraph: {
    title: pageTitleFull("Club Wage Bills"),
    description: "Browse club squads and total wage bills with cited sources.",
    url: siteUrl("/clubs"),
  },
  twitter: {
    card: "summary",
    title: pageTitleFull("Club Wage Bills"),
    description: "Club wage bills across leagues.",
  },
};

export default async function ClubsIndexPage() {
  await connection();
  const clubs = await getAllClubs();
  const roster = await loadRoster();

  if (!clubs.length) {
    return (
      <StateMessage
        title="No clubs yet"
        message="Run schema.sql and scripts/seed.sql in Supabase."
      />
    );
  }

  const billBySlug = new Map<string, number>();
  if (roster.ok) {
    for (const row of roster.rows) {
      if (!row.club?.slug) continue;
      billBySlug.set(
        row.club.slug,
        (billBySlug.get(row.club.slug) ?? 0) +
          (row.contract?.annual_wage_gbp ?? 0),
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Clubs</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Wage bills from players on file, grouped by league.
        </p>
      </div>
      {Array.from(
        clubs.reduce((map, club) => {
          const key = club.league?.name ?? "Other";
          const list = map.get(key) ?? [];
          list.push(club);
          map.set(key, list);
          return map;
        }, new Map<string, typeof clubs>()),
      ).map(([leagueName, leagueClubs]) => (
        <section key={leagueName} className="space-y-3">
          <h2 className="text-lg font-semibold">{leagueName}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {leagueClubs.map((club) => (
              <li key={club.id}>
                <Link
                  href={`/clubs/${club.slug}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-600/40 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <h3 className="text-lg font-semibold">{club.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {billBySlug.get(club.slug) ? (
                      <>
                        Annual bill on file:{" "}
                        <span className="font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                          {formatMoney(
                            billBySlug.get(club.slug),
                            club.league?.currency ?? "GBP",
                          )}
                        </span>
                      </>
                    ) : (
                      "No wages on file yet"
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
