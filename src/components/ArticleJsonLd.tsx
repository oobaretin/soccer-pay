import { PREFERRED_SITE_DOMAIN, SITE_NAME } from "@/lib/brand";
import type { ArticleDefinition } from "@/content/article-definitions";

type Props = {
  article: ArticleDefinition;
  dateModified: string | null;
};

export function ArticleJsonLd({ article, dateModified }: Props) {
  const url = `${PREFERRED_SITE_DOMAIN}/articles/${article.slug}`;
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
      url: PREFERRED_SITE_DOMAIN,
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
