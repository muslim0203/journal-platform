import { revalidatePath } from "next/cache";
import { addJournal } from "@/lib/config/journals";

async function addAction(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const oaiEndpoint = (formData.get("oaiEndpoint") as string)?.trim();
  if (!name || !oaiEndpoint) return;
  await addJournal({ name, oaiEndpoint });
  revalidatePath("/admin/journals");
  revalidatePath("/admin/journals/new");
}

export default function NewJournalPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Yangi jurnal qo‘shish</h1>
        <p className="text-sm text-neutral-600">OAI-PMH endpoint manzilini kiriting.</p>
      </header>

      <form action={addAction} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Jurnal nomi</label>
          <input
            name="name"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">OAI-PMH endpoint</label>
          <input
            name="oaiEndpoint"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="https://example.com/index.php/journal/oai"
            required
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Saqlash
        </button>
      </form>
    </div>
  );
}


