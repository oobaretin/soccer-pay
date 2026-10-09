import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticleSlugs } from "@/content/articles";

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
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.description };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold">{article.title}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{article.description}</p>
      <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
        {article.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <Link
          href="/?sort=annual&dir=desc"
          className="text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Highest paid (salary table) →
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
