import { revalidatePath } from "next/cache";
import { getCachedArticles } from "@/lib/cache/articlesCache";
import { runFullHarvest } from "@/lib/harvest/runFullHarvest";

async function runAction() {
  "use server";
  await runFullHarvest();
  revalidatePath("/admin/cron");
}

export default async function CronPage() {
  const { articles, lastUpdated } = await getCachedArticles();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Cron boshqaruvi</h1>
        <p className="text-sm text-neutral-600">Maqolalar keshini qo‘lda yangilash.</p>
      </header>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-700 dark:text-neutral-200">
          Keshdagi maqolalar: {articles.length}
        </p>
        <p className="text-sm text-neutral-500">Oxirgi yangilanish: {lastUpdated ?? "—"}</p>
      </div>

      <form action={runAction}>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Cron ishga tushirish
        </button>
      </form>
    </div>
  );
}



