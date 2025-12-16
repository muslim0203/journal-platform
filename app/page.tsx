import Link from "next/link";
import { extractTopics, filterArticlesByTopic } from "@/lib/topics";
import { getArticles } from "@/lib/cache/articlesKV";

// Force dynamic generation to avoid build-time KV access
export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: { topic?: string } }) {
  const articles = await getArticles();
  const topics = extractTopics(articles);
  const selectedTopic = searchParams?.topic ?? null;

  const topicButtons = topics
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
    .map((t) => (
      <Link
        key={t.slug}
        href={`/?topic=${t.slug}`}
        className={`rounded-full border px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800 ${
          selectedTopic === t.slug ? "border-blue-500 text-blue-600" : "border-neutral-200"
        }`}
      >
        {t.name} ({t.count})
      </Link>
    ));

  const filtered = filterArticlesByTopic(articles, selectedTopic || undefined);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">OJS maqolalar ro‘yxati</h1>
        <p className="text-sm text-neutral-600">
          OAI-PMH orqali real jurnaldan olingan maqolalar (frontend-only).
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {topicButtons}
      </div>

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
                <Link
                  key={t}
                  href={`/topics/${encodeURIComponent(t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))}`}
                  className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {t}
                </Link>
              ))}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-neutral-500">Hozircha maqolalar yuklab olinmadi.</p>
        )}
      </div>
    </div>
  );
}
