export type ArticleSlug =
  | "highest-paid-football-players-2026"
  | "highest-paid-premier-league-players"
  | "highest-paid-players-by-league"
  | "contracts-expiring-2027"
  | "highest-paid-player-at-every-premier-league-club";

export type ArticleDefinition = {
  slug: ArticleSlug;
  /** Metadata / H1 topic segment (before “2026”). */
  title: string;
  summary: string;
  tag: string;
  description: string;
  intro: string;
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
