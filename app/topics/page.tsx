import Link from "next/link";
import { extractTopics } from "@/lib/topics";
import { getCachedArticles } from "@/lib/cache/articlesKV";

// Force dynamic generation to avoid build-time KV access
export const dynamic = 'force-dynamic';

export default async function TopicsPage() {
  const { articles } = await getCachedArticles();
  const topics = extractTopics(articles).sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Mavzular</h1>
        <p className="text-sm text-neutral-600">Mavzu bo‘yicha maqolalar soni.</p>
      </header>

      {topics.length === 0 && (
        <p className="text-sm text-neutral-500">Mavzular topilmadi.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((t) => (
          <Link
            key={t.slug}
            href={`/topics/${t.slug}`}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="font-medium">{t.name}</span>
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              {t.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}


