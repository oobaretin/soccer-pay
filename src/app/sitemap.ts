import type { MetadataRoute } from "next";
import { getArticleSlugs } from "@/content/article-definitions";
import { getClubSlugs } from "@/lib/queries/get-clubs";
import { getLeagueSlugs } from "@/lib/queries/get-leagues";
import { getPlayerSlugs } from "@/lib/queries/get-player";
import {
  getPlayerLastModified,
  getSiteContentLastModified,
} from "@/lib/queries/get-sitemap-dates";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [players, clubs, leagues, playerDates, siteMod] = await Promise.all([
    getPlayerSlugs(),
    getClubSlugs(),
    getLeagueSlugs(),
    getPlayerLastModified(),
    getSiteContentLastModified(),
  ]);

  const modByPlayer = new Map(
    playerDates.map((p) => [p.slug, p.lastModified ?? undefined]),
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      changeFrequency: "daily",
      priority: 1,
      lastModified: siteMod ?? undefined,
    },
    {
      url: `${base}/clubs`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: siteMod ?? undefined,
    },
    {
      url: `${base}/compare`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/articles`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: siteMod ?? undefined,
    },
    {
      url: `${base}/expiring`,
      changeFrequency: "weekly",
      priority: 0.75,
      lastModified: siteMod ?? undefined,
    },
  ];

  const playerRoutes = players.map((slug) => ({
    url: `${base}/players/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
    lastModified: modByPlayer.get(slug) ?? siteMod ?? undefined,
  }));

  const clubRoutes = clubs.map((slug) => ({
    url: `${base}/clubs/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
    lastModified: siteMod ?? undefined,
  }));

  const leagueRoutes = leagues.map((slug) => ({
    url: `${base}/leagues/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
    lastModified: siteMod ?? undefined,
  }));

  const articleRoutes = getArticleSlugs().map((slug) => ({
    url: `${base}/articles/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...leagueRoutes,
    ...playerRoutes,
    ...clubRoutes,
    ...articleRoutes,
  ];
}
