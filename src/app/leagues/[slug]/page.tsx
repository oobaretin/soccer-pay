import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleRelatedLinks } from "@/components/ArticleRelatedLinks";
import { LeagueClubsSection } from "@/components/LeagueClubsSection";
import { LeagueSalarySection } from "@/components/LeagueSalarySection";
import { PageHeader } from "@/components/PageHeader";
import { pageTitleFull } from "@/lib/brand";
import { getAllClubs } from "@/lib/queries/get-clubs";
import { getLeagueBySlug, getLeagueSlugs } from "@/lib/queries/get-leagues";
import { loadRoster } from "@/lib/queries/load-roster";
import { getSiteUrl } from "@/lib/site-url";

type Params = Promise<{ slug: string }>;

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-10 max-w-md animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="hidden h-72 animate-pulse rounded-xl border border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-950" />
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = await getLeagueSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) return { title: "League not found" };

  const title = `${league.name} Player Salaries 2026`;
  const description = `${league.name} player wages, contract lengths and club wage bills. Figures labeled Verified, Reported or Estimated.`;
  const url = `${getSiteUrl()}/leagues/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title: pageTitleFull(title),
      description,
      url,
    },
    twitter: {
      card: "summary",
      title: pageTitleFull(title),
      description,
    },
  };
}

export default async function LeaguePage({ params }: { params: Params }) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const [clubs, roster] = await Promise.all([getAllClubs(), loadRoster()]);
  const leagueClubs = clubs.filter((c) => c.league?.slug === slug);
  const billByClubSlug = new Map<string, number>();
  if (roster.ok) {
    for (const row of roster.rows) {
      if (!row.club?.slug) continue;
      billByClubSlug.set(
        row.club.slug,
        (billByClubSlug.get(row.club.slug) ?? 0) +
          (row.contract?.annual_wage_gbp ?? 0),
      );
    }
  }

  const subtitle = [
    league.country,
    league.currency ? `Contracts in ${league.currency}` : null,
    "Verified, reported, and estimated wages with sources",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${league.name} Player Salaries 2026`}
        subtitle={subtitle}
        hint="Use the table to sort and search; open a player for contract sources and 2024-25 stats when available."
        breadcrumbs={[
          { label: "Salaries", href: "/" },
          { label: "Leagues", href: "/leagues" },
          { label: league.name },
        ]}
      />
      <Suspense fallback={<TableSkeleton />}>
        <LeagueSalarySection
          leagueSlug={slug}
          tableUrlBasePath={`/leagues/${slug}`}
        />
      </Suspense>
      <LeagueClubsSection
        leagueName={league.name}
        clubs={leagueClubs}
        billByClubSlug={billByClubSlug}
      />
      <ArticleRelatedLinks leagueSlug={slug} />
    </div>
  );
}
