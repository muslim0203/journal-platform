import { getJournals, type JournalConfig } from "@/lib/config/journals";
import { harvestOjsArticles } from "@/lib/oai/harvestOjs";
import { setArticles, clearCache } from "@/lib/cache/articlesKV";
import type { Article } from "@/lib/mockArticles";
import { slugify } from "@/lib/mockArticles";

export async function runFullHarvest(): Promise<{ count: number; journals: JournalConfig[]; articles: Article[] }> {
  console.log("=".repeat(60));
  console.log("[Harvest] ===== FULL HARVEST STARTED =====");
  console.log("=".repeat(60));
  
  // Step 1: Clear Redis KV keys before harvest
  console.log("[Harvest] Step 1: Clearing Redis KV cache...");
  try {
    await clearCache();
    console.log("[Harvest] ✓ Cache cleared successfully");
  } catch (err) {
    console.error("[Harvest] ✗ Cache clear failed:", err);
    throw err;
  }
  
  // Step 2: Get active journals
  console.log("[Harvest] Step 2: Loading journal configuration...");
  const journals = await getJournals();
  console.log(`[Harvest] Found ${journals.length} total journals`);
  const active = journals.filter((j) => j.active);
  console.log(`[Harvest] ${active.length} active journals to harvest`);
  
  if (active.length === 0) {
    console.warn("[Harvest] No active journals found, aborting harvest");
    return { count: 0, journals: [], articles: [] };
  }
  
  // Step 3: Harvest from all active journals with pagination
  console.log("[Harvest] Step 3: Starting OAI-PMH harvest with pagination...");
  const collected: Article[] = [];
  let totalPages = 0;
  
  for (const j of active) {
    console.log(`[Harvest] --- Harvesting from: ${j.name} ---`);
    console.log(`[Harvest] Endpoint: ${j.oaiEndpoint}`);
    
    const arts = await harvestOjsArticles({ endpoint: j.oaiEndpoint, limit: 10000 });
    
    // Count pages (approximate: each page typically has 100-200 records)
    const estimatedPages = Math.ceil(arts.length / 150);
    totalPages += estimatedPages;
    
    console.log(`[Harvest] ✓ Collected ${arts.length} articles from ${j.name} (~${estimatedPages} pages)`);
    collected.push(...arts);
    console.log(`[Harvest] Total articles so far: ${collected.length}`);
  }

  console.log(`[Harvest] Step 4: Harvest complete - ${collected.length} total articles from ${totalPages} estimated pages`);
  
  // Step 5: Verify and fix slugs
  console.log("[Harvest] Step 5: Verifying article slugs...");
  let fixedCount = 0;
  let missingSlugCount = 0;
  
  for (const article of collected) {
    if (!article.slug || article.slug.trim() === "") {
      missingSlugCount++;
      const generatedSlug = slugify(article.title);
      if (generatedSlug) {
        article.slug = generatedSlug;
        fixedCount++;
        if (fixedCount <= 3) {
          console.log(`[Harvest] Fixed missing slug: "${article.title.substring(0, 40)}..." -> "${generatedSlug}"`);
        }
      } else {
        console.warn(`[Harvest] Could not generate slug for: "${article.title.substring(0, 50)}..."`);
      }
    }
  }
  
  if (fixedCount > 0) {
    console.log(`[Harvest] ✓ Fixed ${fixedCount} articles with missing slugs`);
  }
  if (missingSlugCount > fixedCount) {
    console.warn(`[Harvest] ⚠ ${missingSlugCount - fixedCount} articles still have missing slugs`);
  }
  
  // Step 6: Filter out articles without valid slugs
  const validArticles = collected.filter((a) => a.slug && a.slug.trim() !== "");
  if (validArticles.length < collected.length) {
    console.warn(`[Harvest] ⚠ Filtered out ${collected.length - validArticles.length} articles without valid slugs`);
  }
  
  // Step 7: Log sample slugs
  console.log("[Harvest] Step 6: Sample article slugs (first 5):");
  validArticles.slice(0, 5).forEach((article, idx) => {
    console.log(`[Harvest]   ${idx + 1}. "${article.slug}" -> "${article.title.substring(0, 50)}..."`);
  });
  
  // Step 8: Write to Redis ONCE at the end
  console.log("[Harvest] Step 7: Writing to Redis KV (single write)...");
  console.log(`[Harvest] Writing ${validArticles.length} articles to Redis...`);
  
  try {
    await setArticles(validArticles);
    console.log(`[Harvest] ✓ Successfully wrote ${validArticles.length} articles to Redis`);
  } catch (err) {
    console.error("[Harvest] ✗ Failed to write articles to Redis:", err);
    throw err;
  }
  
  // Final summary
  console.log("=".repeat(60));
  console.log("[Harvest] ===== HARVEST SUMMARY =====");
  console.log(`[Harvest] Total pages fetched: ~${totalPages}`);
  console.log(`[Harvest] Total articles collected: ${collected.length}`);
  console.log(`[Harvest] Valid articles (with slugs): ${validArticles.length}`);
  console.log(`[Harvest] Articles written to Redis: ${validArticles.length}`);
  console.log(`[Harvest] Active journals: ${active.length}`);
  console.log("=".repeat(60));
  console.log("[Harvest] ===== FULL HARVEST COMPLETED =====");
  console.log("=".repeat(60));
  
  return { count: validArticles.length, journals: active, articles: validArticles };
}

