import { SITE_NAME } from "@/lib/brand";
import { getSiteUrl, siteUrl } from "@/lib/site-url";
import type { ArticleDefinition } from "@/content/article-definitions";

type Props = {
  article: ArticleDefinition;
  dateModified: string | null;
};

export function ArticleJsonLd({ article, dateModified }: Props) {
  const url = siteUrl(`/articles/${article.slug}`);
  const siteBase = getSiteUrl();
  const headline = `${article.title} 2026`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: article.description,
    url,
    datePublished: article.publishedAt,
    dateModified: dateModified ?? undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteBase,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
