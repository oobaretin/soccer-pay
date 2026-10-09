import type { MetadataRoute } from "next";
import { getArticleSlugs } from "@/content/articles";
import { getClubSlugs } from "@/lib/queries/get-clubs";
import { getPlayerSlugs } from "@/lib/queries/get-player";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [players, clubs] = await Promise.all([getPlayerSlugs(), getClubSlugs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/clubs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/compare`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const playerRoutes = players.map((slug) => ({
    url: `${base}/players/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const clubRoutes = clubs.map((slug) => ({
    url: `${base}/clubs/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const articleRoutes = getArticleSlugs().map((slug) => ({
    url: `${base}/articles/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...playerRoutes, ...clubRoutes, ...articleRoutes];
}
