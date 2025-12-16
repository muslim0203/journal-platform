import Link from "next/link";
import { getArticles } from "@/lib/cache/articlesKV";

export const dynamic = 'force-dynamic';

export default async function ArticlesIndexPage() {
  const articles = await getArticles();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Maqolalar</h1>
        <p className="text-sm text-neutral-600">
          Turli OJS jurnallaridan OAI-PMH orqali yig‘ilgan ilmiy maqolalar ro‘yxati.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-sm text-neutral-500">Hozircha maqolalar mavjud emas.</p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {article.title}
              </h2>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                {article.journal} · {article.year}
              </p>
              {article.authors?.length ? (
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                  {article.authors.map((a) => a.fullName).join(", ")}
                </p>
              ) : null}
              {article.abstract && (
                <p className="mt-2 line-clamp-3 text-sm text-neutral-700 dark:text-neutral-200">
                  {article.abstract}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                {article.doi && (
                  <a
                    href={`https://doi.org/${article.doi.replace(/^https?:\/\/doi.org\//, "")}`}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    DOI: {article.doi}
                  </a>
                )}
                {article.pdfUrl && (
                  <a
                    href={article.pdfUrl}
                    target="_blank"
                    className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-800 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800"
                  >
                    PDF’ni ochish
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        href="/"
        className="mt-4 inline-flex w-fit items-center rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        ← Bosh sahifaga qaytish
      </Link>
    </div>
  );
}


