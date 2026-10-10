import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Club } from "@/lib/types";

type Props = {
  leagueName: string;
  clubs: Club[];
  billByClubSlug: Map<string, number>;
};

export function LeagueClubsSection({
  leagueName,
  clubs,
  billByClubSlug,
}: Props) {
  if (!clubs.length) return null;

  const sorted = [...clubs].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Clubs in {leagueName}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((club) => {
          const bill = billByClubSlug.get(club.slug);
          const currency = club.league?.currency ?? "GBP";
          return (
            <li key={club.id}>
              <Link
                href={`/clubs/${club.slug}`}
                className="block rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-emerald-600/40 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {club.name}
                </span>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {bill ? (
                    <>
                      Annual bill on file:{" "}
                      <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
                        {formatMoney(bill, currency)}
                      </span>
                    </>
                  ) : (
                    "No wages on file yet"
                  )}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
