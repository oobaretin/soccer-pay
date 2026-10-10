import type { Metadata } from "next";
import { Suspense } from "react";
import { LeagueSalarySection } from "@/components/LeagueSalarySection";
import { PageHeader } from "@/components/PageHeader";
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
      <PageHeader
        title="Football Player Salaries 2026"
        subtitle={SITE_TAGLINE}
        hint="Pick a league, then open any player for sources and contract detail."
      />
      <Suspense fallback={<TableSkeleton />}>
        <LeagueSalarySection />
      </Suspense>
    </div>
  );
}
