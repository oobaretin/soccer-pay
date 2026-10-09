import { buildRssXml } from "@/lib/rss-feed";

/** CDN cache (Next 16 cacheComponents disallows segment `revalidate`). */
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
  const xml = buildRssXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
