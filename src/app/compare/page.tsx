import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CompareColumn } from "@/components/CompareColumn";
import { ComparePicker } from "@/components/ComparePicker";
import { StateMessage } from "@/components/StateMessage";
import { getPlayerBySlug, getPlayerOptions } from "@/lib/queries/get-player";

export const metadata: Metadata = {
  title: "Compare players",
  description: "Side-by-side Premier League wages and wage-per-goal metrics.",
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
      <StateMessage title="No players" message="Add players in Supabase first." />
    );
  }
  const slugA = sp.a ?? options[0]?.slug;
  const slugB = sp.b ?? options[1]?.slug ?? options[0]?.slug;
  const [left, right] = await Promise.all([
    slugA ? getPlayerBySlug(slugA) : null,
    slugB ? getPlayerBySlug(slugB) : null,
  ]);
  return (
    <>
      <ComparePicker players={options} slugA={slugA} slugB={slugB} />
      {left && right ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <CompareColumn detail={left} otherName={right.player.name} />
          <CompareColumn detail={right} otherName={left.player.name} />
        </div>
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
      <h1 className="text-3xl font-semibold">Compare players</h1>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-zinc-100" />}>
        <CompareSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
