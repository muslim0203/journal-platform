import { extractTopics } from "@/lib/topics";
import { getCachedArticles } from "@/lib/cache/articlesKV";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Force dynamic generation to avoid build-time KV access
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap() {
  const { articles } = await getCachedArticles();
  const topics = extractTopics(articles);

  // Build safe: return minimal sitemap if no articles during build
  const pages = [
    "",
    "/topics",
    ...(topics.length > 0 ? topics.map((t) => `/topics/${t.slug}`) : []),
    ...(articles.length > 0 ? articles.map((a) => `/articles/${a.slug}`) : []),
  ];

  const now = new Date();

  return pages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
  }));
}


