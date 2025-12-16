import { getJournals, type JournalConfig } from "@/lib/config/journals";
import { harvestOjsArticles } from "@/lib/oai/harvestOjs";
import { setArticles } from "@/lib/cache/articlesKV";
import type { Article } from "@/lib/mockArticles";

export async function runFullHarvest(): Promise<{ count: number; journals: JournalConfig[]; articles: Article[] }> {
  console.log("[Harvest] runFullHarvest started");
  const journals = await getJournals();
  console.log(`[Harvest] Found ${journals.length} total journals`);
  const active = journals.filter((j) => j.active);
  console.log(`[Harvest] ${active.length} active journals`);
  const collected: Article[] = [];

  for (const j of active) {
    console.log(`[Harvest] Harvesting from: ${j.name} (${j.oaiEndpoint})`);
    const arts = await harvestOjsArticles({ endpoint: j.oaiEndpoint, limit: 500 });
    console.log(`[Harvest] Collected ${arts.length} articles from ${j.name}`);
    collected.push(...arts);
  }

  console.log(`[Harvest] Total articles collected: ${collected.length}`);
  console.log(`[Harvest] Calling setArticles with ${collected.length} articles...`);
  await setArticles(collected);
  console.log(`[Harvest] setArticles completed successfully`);
  return { count: collected.length, journals: active, articles: collected };
}

