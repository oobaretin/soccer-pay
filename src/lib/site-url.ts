/**
 * Public site origin for links, feeds, and metadata.
 * Set `NEXT_PUBLIC_SITE_URL` to your `*.vercel.app` URL until the custom domain is live.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (url) return url;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** Absolute URL for a path (sitemap, Open Graph, JSON-LD). */
export function siteUrl(path = ""): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
