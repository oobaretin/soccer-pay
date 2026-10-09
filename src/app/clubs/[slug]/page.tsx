import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WageStatusBadge } from "@/components/WageStatusBadge";
import { getClubBySlug, getClubSlugs } from "@/lib/queries/get-clubs";
import { StateMessage } from "@/components/StateMessage";
import { formatDate, formatGbp } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getClubSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getClubBySlug(slug);
  if (!detail) return { title: "Club not found" };
  const { club, squad } = detail;
  const title = `${club.name} wage bill`;
  const description =
    squad.length > 0
      ? `${club.name} squad wages for ${squad.length} players on file.`
      : `${club.name} — wage bill when squad data is published.`;
  const url = `${getSiteUrl()}/clubs/${slug}`;
  return {
    title,
    description,
    openGraph: { title, description, url },
    twitter: { card: "summary", title, description },
  };
}

async function ClubContent({ params }: { params: Params }) {
  const { slug } = await params;
  const detail = await getClubBySlug(slug);
  if (!detail) notFound();

  const { club, squad, weeklyWageBill, annualWageBill } = detail;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/clubs" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← All clubs
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{club.name}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {squad.length > 0
            ? `${squad.length} players on file. Bonuses and academy players not included.`
            : "No squad wages published for this club yet."}
        </p>
      </div>

      {squad.length === 0 ? (
        <StateMessage
          title="No squad data yet"
          message="Wage bills only include players we have on file. This club will update when more salaries are added."
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Weekly wage bill (on file)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatGbp(weeklyWageBill)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Annual wage bill (on file)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatGbp(annualWageBill)}
              </p>
            </div>
          </section>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Weekly</th>
              <th className="px-4 py-3">Contract end</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {squad.map((row) => (
              <tr key={row.player.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/players/${row.player.slug}`}
                    className="font-medium hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    {row.player.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatGbp(row.contract?.weekly_wage_gbp)}
                </td>
                <td className="px-4 py-3">
                  {formatDate(row.contract?.contract_end)}
                </td>
                <td className="px-4 py-3">
                  {row.contract ? (
                    <WageStatusBadge status={row.contract.status} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function ClubPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <ClubContent params={params} />
    </Suspense>
  );
}
