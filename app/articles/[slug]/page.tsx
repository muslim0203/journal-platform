import Head from "next/head";
import Script from "next/script";
import type { Metadata } from "next";
import { ArticleReaderShell } from "@/components/reader/ArticleReaderShell";
import { getCachedArticles } from "@/lib/cache/articlesCache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function getArticle(slug: string) {
  const { articles } = await getCachedArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) {
    return {
      title: "Maqola topilmadi",
    };
  }
  return {
    title: article.title,
    description: article.abstract || undefined,
    other: {
      citation_title: article.title,
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    author: article.authors.map((a) => ({ "@type": "Person", name: a.fullName })),
    datePublished: String(article.year),
    publisher: article.journal,
    keywords: article.topics,
    identifier: article.doi || articleUrl,
    url: articleUrl,
  };

  return (
    <>
      <Head>
        <title>{article.title}</title>
        <meta name="description" content={article.abstract || ""} />
        <meta name="citation_title" content={article.title} />
        {article.authors.map((a) => (
          <meta key={a.fullName} name="citation_author" content={a.fullName} />
        ))}
        <meta name="citation_publication_date" content={String(article.year)} />
        <meta name="citation_journal_title" content={article.journal} />
        {article.pdfUrl ? <meta name="citation_pdf_url" content={article.pdfUrl} /> : null}
        {article.doi ? <meta name="citation_doi" content={article.doi} /> : null}
      </Head>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleReaderShell article={article} />
    </>
  );
}
