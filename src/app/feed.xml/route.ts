import { buildRssXml } from "@/lib/rss-feed";

export const revalidate = 3600;

export async function GET() {
  const xml = buildRssXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
