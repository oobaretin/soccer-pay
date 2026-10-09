import Link from "next/link";
import { articleDefinitions } from "@/content/article-definitions";

const byLeague: Record<string, string[]> = {
  "premier-league": [
    "highest-paid-premier-league-players",
    "highest-paid-player-at-every-premier-league-club",
  ],
};

const defaultSlugs = [
  "highest-paid-football-players-2026",
  "highest-paid-players-by-league",
  "contracts-expiring-2027",
];

export function ArticleRelatedLinks({ leagueSlug }: { leagueSlug?: string }) {
  const slugs = [
    ...(leagueSlug ? (byLeague[leagueSlug] ?? []) : []),
    ...defaultSlugs,
  ];
  const unique = [...new Set(slugs)];
  const articles = unique
    .map((slug) => articleDefinitions.find((a) => a.slug === slug))
    .filter(Boolean);

  if (!articles.length) return null;

  return (
    <section className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Salary rankings & analysis
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {articles.map((article) =>
          article ? (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {article.title} 2026
              </Link>
              <span className="text-zinc-500"> — {article.summary}</span>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
