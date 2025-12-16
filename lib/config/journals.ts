import { promises as fs } from "fs";
import path from "path";

export type JournalConfig = {
  id: string;
  name: string;
  oaiEndpoint: string;
  active: boolean;
};

const filePath = path.join(process.cwd(), "data", "journals.json");

async function readFile(): Promise<JournalConfig[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [];
}

async function writeFile(data: JournalConfig[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function getJournals(): Promise<JournalConfig[]> {
  return readFile();
}

export async function addJournal(input: { name: string; oaiEndpoint: string }) {
  const list = await readFile();
  const id = `j-${Date.now()}`;
  list.push({ id, name: input.name, oaiEndpoint: input.oaiEndpoint, active: true });
  await writeFile(list);
}

export async function toggleJournal(id: string) {
  const list = await readFile();
  const found = list.find((j) => j.id === id);
  if (found) {
    found.active = !found.active;
    await writeFile(list);
  }
}

export async function deleteJournal(id: string) {
  const list = await readFile();
  const next = list.filter((j) => j.id !== id);
  await writeFile(next);
}

export async function updateJournal(id: string, data: Partial<Omit<JournalConfig, "id">>) {
  const list = await readFile();
  const found = list.find((j) => j.id === id);
  if (found) {
    Object.assign(found, data);
    await writeFile(list);
  }
}



