import type { MetadataRoute } from "next";
import { PREFERRED_SITE_DOMAIN } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${PREFERRED_SITE_DOMAIN}/sitemap.xml`,
  };
}
