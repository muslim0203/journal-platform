import { extractTopics } from "@/lib/topics";
import { getCachedArticles } from "@/lib/cache/articlesKV";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default async function sitemap() {
  const { articles } = await getCachedArticles();
  const topics = extractTopics(articles);

  const pages = [
    "",
    "/topics",
    ...topics.map((t) => `/topics/${t.slug}`),
    ...articles.map((a) => `/articles/${a.slug}`),
  ];

  const now = new Date();

  return pages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
  }));
}


