import { slugify } from "@/lib/mockArticles";

export type Topic = { name: string; slug: string; count: number };

export function extractTopics(articles: { topics: string[] }[]): Topic[] {
  const map = new Map<string, { name: string; count: number }>();
  for (const art of articles) {
    for (const t of art.topics || []) {
      const name = String(t).trim();
      if (!name) continue;
      const slug = slugify(name);
      const current = map.get(slug);
      if (current) {
        current.count += 1;
      } else {
        map.set(slug, { name, count: 1 });
      }
    }
  }
  return Array.from(map.entries()).map(([slug, { name, count }]) => ({ slug, name, count }));
}

export function filterArticlesByTopic<T extends { topics: string[] }>(
  articles: T[],
  topicSlug?: string
): T[] {
  if (!topicSlug) return articles;
  return articles.filter((a) => a.topics.some((t) => slugify(t) === topicSlug));
}



