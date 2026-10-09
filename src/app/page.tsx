import type { Metadata } from "next";
import { Suspense } from "react";
import { LeagueSalarySection } from "@/components/LeagueSalarySection";
import { DEFAULT_TITLE, SITE_TAGLINE } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: `${SITE_TAGLINE} Sortable wages across top leagues with sources and contract tracking.`,
  openGraph: {
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
  },
};

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-10 max-w-md animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-2 md:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          />
        ))}
      </div>
      <div className="hidden h-72 animate-pulse rounded-xl border border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-950" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Football Player Salaries 2026
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {SITE_TAGLINE}
        </p>
        <p className="text-sm text-zinc-500">
          Search by league, then open any player for sources and contract detail.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <LeagueSalarySection />
      </Suspense>
    </div>
  );
}
