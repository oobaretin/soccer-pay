import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { ArticleRankedTable } from "@/components/ArticleRankedTable";
import { ArticleSourcingNote } from "@/components/ArticleSourcingNote";
import { StateMessage } from "@/components/StateMessage";
import {
  getArticleDefinition,
  getArticleSlugs,
  type ArticleSlug,
} from "@/content/article-definitions";
import { pageTitleFull } from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";
import { formatDate } from "@/lib/format";
import { getArticleData } from "@/lib/queries/get-article-data";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleDefinition(slug);
  if (!article) return { title: "Article not found" };

  const title = `${article.title} 2026`;
  const canonical = siteUrl(`/articles/${article.slug}`);

  return {
    title,
    description: article.description,
    alternates: { canonical },
    openGraph: {
      title: pageTitleFull(title),
      description: article.description,
      url: canonical,
    },
    twitter: {
      card: "summary",
      title: pageTitleFull(title),
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticleDefinition(slug);
  if (!article) notFound();

  const data = await getArticleData(slug as ArticleSlug);
  const headline = `${article.title} 2026`;

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <ArticleJsonLd article={article} dateModified={data.ok ? data.updatedAt : null} />

      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
          {article.tag}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {headline}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">{article.description}</p>
        {data.ok && data.updatedAt ? (
          <p className="text-sm text-zinc-500">
            Last updated: {formatDate(data.updatedAt)}
          </p>
        ) : null}
      </header>

      <p className="max-w-2xl leading-relaxed text-zinc-700 dark:text-zinc-300">
        {article.intro}
      </p>

      {!data.ok ? (
        <StateMessage
          variant="error"
          title="Could not load rankings"
          message="We couldn’t reach the wage database. Try again in a moment."
        />
      ) : data.sections.every((s) => s.rows.length === 0) ? (
        <StateMessage
          title="No players to list yet"
          message="This article will populate when matching wages are published in the database."
        />
      ) : (
        <div className="space-y-8">
          {data.sections.map((section) => (
            <section key={section.leagueSlug ?? "main"} className="space-y-3">
              {section.title ? (
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {section.leagueSlug ? (
                    <Link
                      href={`/leagues/${section.leagueSlug}`}
                      className="hover:text-emerald-800 dark:hover:text-emerald-400"
                    >
                      {section.title}
                    </Link>
                  ) : (
                    section.title
                  )}
                </h2>
              ) : null}
              <ArticleRankedTable rows={section.rows} />
            </section>
          ))}
        </div>
      )}

      <ArticleSourcingNote />

      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <Link
          href="/"
          className="text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Full salary table →
        </Link>
        <Link
          href="/articles"
          className="text-emerald-700 hover:underline dark:text-emerald-400"
        >
          All articles →
        </Link>
        <Link
          href="/expiring"
          className="text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Expiring contracts →
        </Link>
      </div>
    </article>
  );
}
