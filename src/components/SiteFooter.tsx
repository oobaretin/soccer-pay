import type { ReactNode } from "react";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { TrustLegend } from "@/components/TrustLegend";
import {
  articleDefinitions,
  type ArticleSlug,
} from "@/content/article-definitions";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import { getLeagues } from "@/lib/queries/get-leagues";
import { siteNavLinks } from "@/lib/site-nav";

const footerArticleSlugs: ArticleSlug[] = [
  "highest-paid-football-players-2026",
  "highest-paid-premier-league-players",
  "england-national-team-salaries-2026",
  "france-national-team-salaries-2026",
  "portugal-world-cup-2026-salaries",
];

const footerArticles = footerArticleSlugs
  .map((slug) => articleDefinitions.find((a) => a.slug === slug))
  .filter((a): a is (typeof articleDefinitions)[number] => Boolean(a));

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-md py-1.5 text-sm text-zinc-400 transition hover:text-white"
    >
      {children}
    </Link>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </p>
  );
}

export async function SiteFooter() {
  const leagues = await getLeagues();

  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-3 lg:col-span-4">
            <SiteLogo variant="footer" className="text-base" />
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              {SITE_TAGLINE}
            </p>
          </div>

          <nav className="space-y-3 lg:col-span-2" aria-label="Browse">
            <FooterHeading>Browse</FooterHeading>
            <ul className="space-y-0.5">
              {siteNavLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-3 lg:col-span-3" aria-label="Leagues">
            <FooterHeading>Leagues</FooterHeading>
            <ul className="space-y-0.5">
              {leagues.map((league) => (
                <li key={league.id}>
                  <FooterLink href={`/leagues/${league.slug}`}>
                    {league.name}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-3 lg:col-span-3" aria-label="Articles">
            <FooterHeading>Insights</FooterHeading>
            <ul className="space-y-0.5">
              {footerArticles.map((article) => (
                <li key={article.slug}>
                  <FooterLink href={`/articles/${article.slug}`}>
                    {article.title}
                  </FooterLink>
                </li>
              ))}
              <li>
                <FooterLink href="/articles">All articles →</FooterLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-8">
          <TrustLegend variant="dark" />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE_NAME}. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/sitemap.xml"
              className="hover:text-zinc-300"
            >
              Sitemap
            </Link>
            <span>
              Figures are indicative — see player pages for sources.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
