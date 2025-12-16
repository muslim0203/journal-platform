import Link from "next/link";
import { extractTopics, filterArticlesByTopic } from "@/lib/topics";
import { getCachedArticles } from "@/lib/cache/articlesKV";

// Force dynamic generation to avoid build-time KV access
export const dynamic = 'force-dynamic';

export default async function TopicDetailPage({ params }: { params: { slug: string } }) {
  const { articles } = await getCachedArticles();
  const topics = extractTopics(articles);
  const topic = topics.find((t) => t.slug === params.slug);
  const filtered = filterArticlesByTopic(articles, params.slug);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">
          {topic ? topic.name : "Mavzu topilmadi"}
        </h1>
        <p className="text-sm text-neutral-600">
          {topic ? `${filtered.length} ta maqola` : "Bunday mavzu mavjud emas."}
        </p>
        <Link href="/topics" className="text-sm text-blue-600 hover:underline">
          ← Mavzular ro‘yxatiga qaytish
        </Link>
      </header>

      {filtered.length === 0 && (
        <p className="text-sm text-neutral-500">Ushbu mavzuda maqolalar topilmadi.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2 className="text-lg font-semibold">{article.title}</h2>
            <p className="text-sm text-neutral-600">
              {article.journal} · {article.year}
            </p>
            <p className="mt-2 line-clamp-3 text-sm text-neutral-700 dark:text-neutral-200">
              {article.abstract || "Annotatsiya mavjud emas."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.topics.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


