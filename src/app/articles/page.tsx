import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { articleDefinitions } from "@/content/article-definitions";
import { getArticlePreview } from "@/lib/queries/get-article-data";
import { siteUrl } from "@/lib/site-url";

const INDEX_TITLE = "Football Salary Rankings & Analysis | FB Salaries";

export const metadata: Metadata = {
  title: { absolute: INDEX_TITLE },
  description:
    "Data-driven football salary rankings and contract analysis, updated from our live wage database.",
  alternates: {
    canonical: siteUrl("/articles"),
  },
  openGraph: {
    title: INDEX_TITLE,
    description:
      "Live highest-paid lists, league breakdowns, and expiring contracts.",
    url: siteUrl("/articles"),
  },
  twitter: {
    card: "summary",
    title: INDEX_TITLE,
    description:
      "Live highest-paid lists, league breakdowns, and expiring contracts.",
  },
};

export default async function ArticlesIndexPage() {
  const previews = await Promise.all(
    articleDefinitions.map(async (article) => ({
      article,
      preview: await getArticlePreview(article.slug),
    })),
  );

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Football salary rankings & analysis
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Live lists built from our wage database — figures refresh when
          contracts are updated.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {previews.map(({ article, preview }) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-900/20 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
                {article.tag}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {article.title} 2026
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {article.summary}
              </p>
              <p className="mt-3 text-xs text-zinc-500">
                {preview.updatedAt
                  ? `Last updated ${formatDate(preview.updatedAt)}`
                  : "Last updated —"}
                {preview.rowCount > 0
                  ? ` · ${preview.rowCount} players listed`
                  : null}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
