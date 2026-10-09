import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { StateMessage } from "@/components/StateMessage";
import { getAllClubs } from "@/lib/queries/get-clubs";
import { loadRoster } from "@/lib/queries/load-roster";
import { formatGbp } from "@/lib/format";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Premier League club wage bills and squads on file.",
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
          Reported annual wage bill from players on file per club.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {clubs.map((club) => (
          <li key={club.id}>
            <Link
              href={`/clubs/${club.slug}`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-600/40 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-semibold">{club.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Annual bill on file:{" "}
                <span className="font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                  {formatGbp(billBySlug.get(club.slug) ?? 0)}
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
