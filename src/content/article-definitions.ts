export type ArticleSlug =
  | "highest-paid-football-players-2026"
  | "highest-paid-premier-league-players"
  | "highest-paid-players-by-league"
  | "contracts-expiring-2027"
  | "highest-paid-player-at-every-premier-league-club"
  | "portugal-world-cup-2026-salaries";

export type ArticleDefinition = {
  slug: ArticleSlug;
  /** Metadata / H1 topic segment (before “2026”). */
  title: string;
  summary: string;
  tag: string;
  description: string;
  intro: string;
  /** Fixed first-publication date (ISO calendar day, UTC). */
  publishedAt: string;
};

export const articleDefinitions: ArticleDefinition[] = [
  {
    slug: "highest-paid-football-players-2026",
    title: "Highest Paid Football Players",
    summary:
      "Top earners across every league on file, ranked by USD-equivalent annual wage.",
    tag: "All leagues",
    description:
      "Live ranking of the highest paid football players in 2026 with weekly and annual wages, USD equivalents, contract end dates, and source labels.",
    intro:
      "This list updates automatically from our wage database. Players are ranked by USD-equivalent annual pay using fixed reference exchange rates so leagues can be compared fairly.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "highest-paid-premier-league-players",
    title: "Highest Paid Premier League Players",
    summary: "The top 20 Premier League salaries on file for the current season.",
    tag: "Premier League",
    description:
      "Premier League highest paid players in 2026: reported and estimated weekly wages, annual totals, contract expiry, and links to sources on each profile.",
    intro:
      "Premier League figures below reflect the latest contract row we hold for each player. Amounts stay in the club’s currency with an approximate USD column for context.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "highest-paid-players-by-league",
    title: "Highest Paid Players by League",
    summary: "Top five earners in each league we cover, refreshed from live data.",
    tag: "Multi-league",
    description:
      "Highest paid football players in each major league in 2026 — top five per competition with wages, contract dates, and verification status.",
    intro:
      "Each section shows the five highest annual wages on file for that league. Rankings use the same USD-equivalent sort as our main salary table.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "contracts-expiring-2027",
    title: "Football Contracts Expiring Soon",
    summary:
      "Deals ending within the next twelve months, with current wages where published.",
    tag: "Contracts",
    description:
      "Football contracts expiring in the next 12 months: who is out of contract soon, current wage figures, and links to player profiles for sources.",
    intro:
      "Contracts listed here end within the next twelve months from today’s UTC date. Wages appear only when we have a published figure on file.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "highest-paid-player-at-every-premier-league-club",
    title: "Highest Paid Player at Every Premier League Club",
    summary:
      "The top earner on file at each Premier League club, one row per team.",
    tag: "Premier League",
    description:
      "Highest paid player at each Premier League club in 2026 — one wage leader per team with contract details and source badges.",
    intro:
      "For every Premier League club with at least one wage on file, we show the highest annual earner in the squad. Ties follow our standard USD-equivalent annual sort.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "portugal-world-cup-2026-salaries",
    title: "Portugal World Cup Squad Salaries",
    summary:
      "Wages on file for Seleção players at club level — ranked for the 2026 World Cup cycle.",
    tag: "Portugal · World Cup",
    description:
      "Portugal FIFA World Cup 2026 squad salaries: club wages for internationals on file, with sources and reported vs estimated labels.",
    intro:
      "Figures below are club wages for players we track who appear in Portugal’s World Cup squad pool — not FPF match fees. Rankings use USD-equivalent annual pay like our main salary table.",
    publishedAt: "2026-10-09",
  },
];

export function getArticleDefinition(
  slug: string,
): ArticleDefinition | undefined {
  return articleDefinitions.find((a) => a.slug === slug);
}

export function getArticleSlugs(): ArticleSlug[] {
  return articleDefinitions.map((a) => a.slug);
}
