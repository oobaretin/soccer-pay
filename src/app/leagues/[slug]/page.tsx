import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleRelatedLinks } from "@/components/ArticleRelatedLinks";
import { LeagueSalarySection } from "@/components/LeagueSalarySection";
import { pageTitleFull } from "@/lib/brand";
import { getLeagueBySlug, getLeagueSlugs } from "@/lib/queries/get-leagues";
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

  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {league.name} Player Salaries 2026
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Football player salaries, contracts and net worth.
        </p>
        <p className="text-sm text-zinc-500">
          Search by league, then open any player for sources and contract detail.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <LeagueSalarySection
          leagueSlug={slug}
          tableUrlBasePath={`/leagues/${slug}`}
        />
      </Suspense>
      <ArticleRelatedLinks leagueSlug={slug} />
    </div>
  );
}
