import type { Metadata } from "next";
import Script from "next/script";
import { ArticleReaderShell } from "@/components/reader/ArticleReaderShell";
import { getCachedArticles } from "@/lib/cache/articlesKV";
import type { Article } from "@/lib/mockArticles";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Force dynamic generation to avoid build-time KV access
export const dynamic = 'force-dynamic';

async function getArticle(slug: string): Promise<Article | null> {
  const { articles } = await getCachedArticles();
  
  // Decode URL-encoded slug (Next.js params are already decoded, but be safe)
  const decodedSlug = decodeURIComponent(slug);
  
  // First, try to find by exact slug match
  let article = articles.find((a) => {
    if (!a.slug) return false;
    // Compare both original and decoded versions
    return a.slug === slug || a.slug === decodedSlug;
  });
  
  if (article) {
    console.log(`[getArticle] Found article by slug: "${slug}" -> "${article.title.substring(0, 50)}..."`);
    return article;
  }
  
  // Safety: If slug is missing in old cached data, try to regenerate and match
  const { slugify } = await import("@/lib/mockArticles");
  article = articles.find((a) => {
    // If article has no slug, generate it and compare
    if (!a.slug && a.title) {
      const generatedSlug = slugify(a.title);
      return generatedSlug === slug || generatedSlug === decodedSlug;
    }
    return false;
  });
  
  if (article) {
    console.warn(`[getArticle] Found article by regenerated slug: "${slug}" -> "${article.title.substring(0, 50)}..." (slug was missing, regenerated)`);
    // Regenerate and save slug for future use (in-memory fix, will be persisted on next harvest)
    article.slug = slugify(article.title);
    return article;
  }
  
  // Log available slugs for debugging
  console.error(`[getArticle] Article not found for slug: "${slug}" (decoded: "${decodedSlug}")`);
  if (articles.length > 0) {
    console.error(`[getArticle] Total articles in cache: ${articles.length}`);
    console.error(`[getArticle] Articles with slugs: ${articles.filter(a => a.slug).length}`);
    console.error(`[getArticle] Articles without slugs: ${articles.filter(a => !a.slug).length}`);
    console.error(`[getArticle] Available slugs (first 10):`, articles.slice(0, 10).map(a => a.slug || `MISSING: "${a.title?.substring(0, 30) || 'NO TITLE'}"`));
    
    // Try to find similar slugs for debugging
    const similarSlugs = articles
      .filter(a => a.slug && (a.slug.includes(slug.substring(0, 10)) || slug.includes(a.slug.substring(0, 10))))
      .slice(0, 5)
      .map(a => a.slug);
    if (similarSlugs.length > 0) {
      console.error(`[getArticle] Similar slugs found:`, similarSlugs);
    }
  } else {
    console.error(`[getArticle] No articles in cache!`);
  }
  
  return null;
}

function truncateDescription(text: string | undefined, maxLength: number = 160): string | undefined {
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) {
    return {
      title: "Maqola topilmadi",
    };
  }

  const articleUrl = `${BASE_URL}/articles/${article.slug}`;
  const description = truncateDescription(article.abstract);

  // Build citation authors array
  const citationAuthors = article.authors.map((a) => a.fullName);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: description || undefined,
      type: "article",
      publishedTime: String(article.year),
      authors: citationAuthors,
      siteName: "Academic Journal Platform",
    },
    other: {
      // Google Scholar citation meta tags
      citation_title: article.title,
      // First author (additional authors added via script in page component)
      ...(article.authors.length > 0 ? { citation_author: article.authors[0].fullName } : {}),
      citation_publication_date: String(article.year),
      citation_journal_title: article.journal,
      ...(article.pdfUrl ? { citation_pdf_url: article.pdfUrl } : {}),
      ...(article.doi ? { citation_doi: article.doi } : {}),
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Maqola topilmadi</h1>
      </div>
    );
  }

  const articleUrl = `${BASE_URL}/articles/${article.slug}`;
  
  // JSON-LD structured data for ScholarlyArticle
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    author: article.authors.map((a) => ({
      "@type": "Person",
      name: a.fullName,
    })),
    datePublished: String(article.year),
    publisher: {
      "@type": "Organization",
      name: article.journal,
    },
    ...(article.topics && article.topics.length > 0 ? { keywords: article.topics.join(", ") } : {}),
    ...(article.abstract ? { description: article.abstract } : {}),
    identifier: article.doi ? `https://doi.org/${article.doi.replace(/^https?:\/\/doi.org\//, "")}` : articleUrl,
    url: articleUrl,
    ...(article.pdfUrl ? { encoding: { "@type": "MediaObject", contentUrl: article.pdfUrl } } : {}),
  };

  // Add additional citation_author meta tags for Google Scholar (beyond the first one in metadata)
  const additionalAuthors = article.authors.slice(1);

  return (
    <>
      {/* Add additional citation_author meta tags for Google Scholar */}
      {additionalAuthors.length > 0 && (
        <Script
          id="citation-authors-meta"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const authors = ${JSON.stringify(additionalAuthors.map((a) => a.fullName))};
                authors.forEach(function(author) {
                  const meta = document.createElement('meta');
                  meta.name = 'citation_author';
                  meta.content = author;
                  document.head.appendChild(meta);
                });
              })();
            `,
          }}
        />
      )}
      
      {/* JSON-LD structured data */}
      <Script
        id="article-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ArticleReaderShell article={article} />
    </>
  );
}
