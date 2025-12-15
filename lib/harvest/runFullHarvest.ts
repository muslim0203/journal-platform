import { getJournals, type JournalConfig } from "@/lib/config/journals";
import { harvestOjsArticles } from "@/lib/oai/harvestOjs";
import { setCachedArticles } from "@/lib/cache/articlesCache";
import type { Article } from "@/lib/mockArticles";

export async function runFullHarvest(): Promise<{ count: number; journals: JournalConfig[] }> {
  const journals = await getJournals();
  const active = journals.filter((j) => j.active);
  const collected: Article[] = [];

  for (const j of active) {
    const arts = await harvestOjsArticles({ endpoint: j.oaiEndpoint, limit: 500 });
    collected.push(...arts);
  }

  await setCachedArticles(collected);
  return { count: collected.length, journals: active };
}


