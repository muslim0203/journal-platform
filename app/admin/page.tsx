import Link from "next/link";
import { getCachedArticles } from "@/lib/cache/articlesCache";

export default async function AdminDashboard() {
  const { articles, lastUpdated } = await getCachedArticles();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-neutral-600">Jurnallar va cron boshqaruvi.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/journals"
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2 className="text-lg font-semibold">Jurnallar</h2>
          <p className="text-sm text-neutral-600">Manbalarni ko‘rish va boshqarish.</p>
        </Link>
        <Link
          href="/admin/cron"
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2 className="text-lg font-semibold">Cron</h2>
          <p className="text-sm text-neutral-600">Qo‘lda yangilashni ishga tushirish.</p>
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-sm font-semibold">Statistika</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-200">
          Keshdagi maqolalar: {articles.length}
        </p>
        <p className="text-sm text-neutral-500">
          Oxirgi yangilanish: {lastUpdated ?? "—"}
        </p>
      </div>
    </div>
  );
}


