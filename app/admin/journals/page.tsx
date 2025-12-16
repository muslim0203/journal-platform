import { revalidatePath } from "next/cache";
import Link from "next/link";
import { getJournals, toggleJournal, deleteJournal } from "@/lib/config/journals";

async function toggleAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await toggleJournal(id);
  revalidatePath("/admin/journals");
}

async function deleteAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteJournal(id);
  revalidatePath("/admin/journals");
}

export default async function JournalsPage() {
  const journals = await getJournals();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Jurnallar</h1>
          <p className="text-sm text-neutral-600">OAI-PMH manbalarini boshqarish.</p>
        </div>
        <Link
          href="/admin/journals/new"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Yangi jurnal
        </Link>
      </header>

      <div className="space-y-3">
        {journals.length === 0 && (
          <p className="text-sm text-neutral-500">Jurnal topilmadi.</p>
        )}
        {journals.map((j) => (
          <div
            key={j.id}
            className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{j.name}</p>
                <p className="text-xs text-neutral-600">{j.oaiEndpoint}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  j.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {j.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <form action={toggleAction}>
                <input type="hidden" name="id" value={j.id} />
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {j.active ? "O‘chirish" : "Yoqish"}
                </button>
              </form>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={j.id} />
                <button
                  type="submit"
                  className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30"
                >
                  O‘chirish
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



