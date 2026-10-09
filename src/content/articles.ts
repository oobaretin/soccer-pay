export type Article = {
  slug: string;
  title: string;
  description: string;
  published: string;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "highest-paid-premier-league-players",
    title: "Highest paid Premier League players (2024–25)",
    description:
      "Reported weekly and annual wages for top earners, with sources and wage-per-goal context.",
    published: "2025-10-01",
    body: [
      "Premier League wage figures are rarely confirmed by clubs. Soccer Pay lists reported numbers from reputable outlets and labels each figure as verified, reported, or estimated.",
      "When comparing earners, look beyond the headline weekly wage: contract length, bonuses (not yet modeled here), and output metrics such as wage per goal help explain value on the pitch.",
      "Use the main wages table to sort by annual pay or contract end date. Our contract expiry tracker highlights deals ending within twelve months — useful for transfer and renewal speculation.",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}
