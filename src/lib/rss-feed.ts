import { articleDefinitions } from "@/content/article-definitions";
import { PREFERRED_SITE_DOMAIN, SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import { parseIsoDateUtc } from "@/lib/format";

const FEED_PATH = "/feed.xml";
const FEED_LIMIT = 20;

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 pubDate in UTC (RSS 2.0). */
export function formatRfc822Utc(isoDate: string): string {
  return parseIsoDateUtc(isoDate).toUTCString();
}

export type RssFeedItem = {
  title: string;
  link: string;
  guid: string;
  description: string;
  pubDate: string;
};

export function getRssFeedItems(): RssFeedItem[] {
  const sorted = [...articleDefinitions].sort((a, b) => {
    const byPub = b.publishedAt.localeCompare(a.publishedAt);
    if (byPub !== 0) return byPub;
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  });

  return sorted.slice(0, FEED_LIMIT).map((article) => {
    const link = `${PREFERRED_SITE_DOMAIN}/articles/${article.slug}`;
    return {
      title: `${article.title} 2026`,
      link,
      guid: link,
      description: article.summary,
      pubDate: formatRfc822Utc(article.publishedAt),
    };
  });
}

export function buildRssXml(): string {
  const feedUrl = `${PREFERRED_SITE_DOMAIN}${FEED_PATH}`;
  const items = getRssFeedItems();

  const itemXml = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${escapeXml(item.pubDate)}</pubDate>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(PREFERRED_SITE_DOMAIN)}</link>
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemXml}
  </channel>
</rss>
`;
}
