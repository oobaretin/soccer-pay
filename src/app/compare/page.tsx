import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CompareColumn } from "@/components/CompareColumn";
import { CompareSummary } from "@/components/CompareSummary";
import { CompareSwapButton } from "@/components/CompareSwapButton";
import { PageHeader } from "@/components/PageHeader";
import { ComparePicker } from "@/components/ComparePicker";
import { StateMessage } from "@/components/StateMessage";
import { pageTitleFull } from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";
import { getPlayerBySlug, getPlayerOptions } from "@/lib/queries/get-player";

export const metadata: Metadata = {
  title: "Compare Player Salaries",
  description:
    "Compare football player wages, contracts, and wage-per-goal side by side.",
  openGraph: {
    title: pageTitleFull("Compare Player Salaries"),
    description:
      "Side-by-side weekly and annual wages with USD approximations.",
    url: siteUrl("/compare"),
  },
  twitter: {
    card: "summary",
    title: pageTitleFull("Compare Player Salaries"),
    description: "Compare player wages and contract details.",
  },
};

type SearchParams = Promise<{ a?: string; b?: string }>;

async function CompareSection({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  const sp = await searchParams;
  const options = await getPlayerOptions();
  if (!options.length) {
    return (
      <StateMessage
        title="No players yet"
        message="Player wages will appear here once the dataset is published."
      />
    );
  }
  const slugA = sp.a ?? options[0]?.slug;
  const slugB = sp.b ?? options[1]?.slug ?? options[0]?.slug;
  const [left, right] = await Promise.all([
    slugA ? getPlayerBySlug(slugA) : null,
    slugB ? getPlayerBySlug(slugB) : null,
  ]);
  const samePlayer = slugA && slugB && slugA === slugB;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <ComparePicker players={options} slugA={slugA} slugB={slugB} />
        </div>
        <CompareSwapButton slugA={slugA} slugB={slugB} />
      </div>
      {samePlayer ? (
        <div className="mt-6">
          <StateMessage
            title="Pick two different players"
            message="Choose another name in Player B to compare wages side by side."
          />
        </div>
      ) : null}
      {left && right && !samePlayer ? (
        <>
          <div className="mt-6">
            <CompareSummary left={left} right={right} />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <CompareColumn detail={left} otherName={right.player.name} />
            <CompareColumn detail={right} otherName={left.player.name} />
          </div>
        </>
      ) : null}
    </>
  );
}

export default function ComparePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare player salaries"
        subtitle="Side-by-side wages, contracts, and 2024-25 stats when on file."
        hint="Share the URL to link directly to a pair — query params a and b are player slugs."
        breadcrumbs={[{ label: "Salaries", href: "/" }, { label: "Compare" }]}
      />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-zinc-100" />}>
        <CompareSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
