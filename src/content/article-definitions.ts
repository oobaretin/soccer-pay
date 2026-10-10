export type ArticleSlug =
  | "highest-paid-football-players-2026"
  | "highest-paid-premier-league-players"
  | "highest-paid-players-by-league"
  | "contracts-expiring-2027"
  | "highest-paid-player-at-every-premier-league-club"
  | "portugal-world-cup-2026-salaries"
  | "france-national-team-salaries-2026"
  | "england-national-team-salaries-2026"
  | "spain-national-team-salaries-2026"
  | "brazil-national-team-salaries-2026"
  | "argentina-national-team-salaries-2026";

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
  {
    slug: "france-national-team-salaries-2026",
    title: "France National Team Salaries",
    summary: "Club wages for Les Bleus players on file, ranked by annual pay.",
    tag: "France",
    description:
      "France international football salaries in 2026: club wages for French nationals in our database with sources and verification labels.",
    intro:
      "Amounts are club wages, not FFF appearance fees. Only players with a published weekly or annual wage on file appear below.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "england-national-team-salaries-2026",
    title: "England National Team Salaries",
    summary: "Club wages for Three Lions players on file ahead of World Cup 2026.",
    tag: "England · World Cup",
    description:
      "England international salaries in 2026: Premier League and overseas club wages for English nationals on file.",
    intro:
      "Figures reflect the latest contract row we hold at each player’s club. Rankings use USD-equivalent annual pay.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "spain-national-team-salaries-2026",
    title: "Spain National Team Salaries",
    summary: "Top club wages for Spanish internationals on file.",
    tag: "Spain",
    description:
      "Spain national team player salaries in 2026 from club contracts on file — La Liga and other leagues.",
    intro:
      "Coverage follows our club-based wage database; not every La Roja squad member may appear until sourced.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "brazil-national-team-salaries-2026",
    title: "Brazil National Team Salaries",
    summary: "Club wages for Seleção players on file across Europe and beyond.",
    tag: "Brazil",
    description:
      "Brazil international football wages in 2026: ranked club salaries for Brazilian players in our database.",
    intro:
      "Includes players at European clubs and other leagues we track. Amounts stay in contract currency with USD context in sort.",
    publishedAt: "2026-10-09",
  },
  {
    slug: "argentina-national-team-salaries-2026",
    title: "Argentina National Team Salaries",
    summary: "Club wages for Albiceleste players on file.",
    tag: "Argentina",
    description:
      "Argentina national team salaries in 2026 from sourced club contracts — Serie A, La Liga, and other leagues on file.",
    intro:
      "Rankings use the same USD-equivalent annual sort as the main salary table.",
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
