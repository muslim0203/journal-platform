import type { Article } from "@/lib/mockArticles";

// Lazy import KV to avoid build-time errors
let kv: any = null;

async function getKV(): Promise<any> {
  if (kv) return kv;
  
  // Skip KV import during build phase
  if (isBuildPhase()) {
    return null;
  }
  
  try {
    const kvModule = await import("@vercel/kv");
    kv = kvModule.kv;
    return kv;
  } catch (err) {
    console.error("[KV] Failed to import @vercel/kv:", err);
    return null;
  }
}

const ARTICLES_KEY = "articles:data";
const LAST_UPDATED_KEY = "articles:lastUpdated";
const STATS_KEY = "articles:stats";
const LAST_SYNC_KEY = "articles:lastSync";

// Detect if we're in build phase (Next.js build time)
function isBuildPhase(): boolean {
  // NEXT_PHASE is set by Next.js during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return true;
  }
  // Check if we're in a build context (Vercel sets this)
  if (process.env.VERCEL_ENV === undefined && process.env.NODE_ENV === "production") {
    // Likely build phase if in production but not in Vercel runtime
    return true;
  }
  // Check if KV env vars are missing (common during build)
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;
  if (!hasUrl || !hasToken) {
    // During build, env vars might not be available yet
    // Only skip if we're definitely in build context
    if (process.env.NEXT_PHASE || process.env.CI) {
      return true;
    }
  }
  return false;
}

// Check if KV environment variables are set
function checkKVConfig(): boolean {
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;
  
  // During build, don't log errors - just return false
  if (isBuildPhase()) {
    return false;
  }
  
  if (!hasUrl || !hasToken) {
    console.error("[KV] Missing environment variables: KV_REST_API_URL or KV_REST_API_TOKEN");
  }
  return hasUrl && hasToken;
}

export async function clearCache(): Promise<void> {
  if (isBuildPhase()) {
    console.log("[KV] Skipped during build phase");
    return;
  }
  
  console.log("[KV] Clearing cache keys before harvest...");
  
  if (!checkKVConfig()) {
    throw new Error("KV environment variables not configured");
  }
  
  const kvInstance = await getKV();
  if (!kvInstance) {
    throw new Error("KV not available");
  }
  
  try {
    await Promise.all([
      kvInstance.del(ARTICLES_KEY),
      kvInstance.del(LAST_UPDATED_KEY),
      kvInstance.del(STATS_KEY),
      kvInstance.del(LAST_SYNC_KEY),
    ]);
    console.log("[KV] Successfully cleared all cache keys");
  } catch (err) {
    console.error("[KV] clearCache failed:", err);
    if (err instanceof Error) {
      console.error("[KV] Error message:", err.message);
    }
    throw err;
  }
}

export async function setArticles(articles: Article[]): Promise<void> {
  if (isBuildPhase()) {
    console.log("[KV] Skipped during build phase");
    return;
  }
  
  console.log(`[KV] setArticles called with ${articles.length} articles`);
  
  if (!checkKVConfig()) {
    throw new Error("KV environment variables not configured");
  }
  
  const kvInstance = await getKV();
  if (!kvInstance) {
    throw new Error("KV not available");
  }
  
  try {
    console.log(`[KV] Writing to key: ${ARTICLES_KEY}`);
    await kvInstance.set(ARTICLES_KEY, articles);
    console.log(`[KV] Successfully wrote ${articles.length} articles`);
    
    const timestamp = new Date().toISOString();
    console.log(`[KV] Writing timestamp to key: ${LAST_UPDATED_KEY}`);
    await kvInstance.set(LAST_UPDATED_KEY, timestamp);
    console.log(`[KV] Successfully wrote timestamp: ${timestamp}`);
  } catch (err) {
    console.error("[KV] setArticles failed:", err);
    console.error("[KV] Error details:", JSON.stringify(err, null, 2));
    if (err instanceof Error) {
      console.error("[KV] Error message:", err.message);
      console.error("[KV] Error stack:", err.stack);
    }
    throw err;
  }
}

export async function getArticles(): Promise<Article[]> {
  // Build-time guard: skip KV access during build
  if (isBuildPhase()) {
    console.log("[KV] Skipped during build phase");
    return [];
  }
  
  console.log(`[KV] getArticles called, reading from key: ${ARTICLES_KEY}`);
  
  if (!checkKVConfig()) {
    console.warn("[KV] Environment variables not configured, returning empty array");
    return [];
  }
  
  const kvInstance = await getKV();
  if (!kvInstance) {
    console.warn("[KV] KV not available, returning empty array");
    return [];
  }
  
  try {
    const data = await kvInstance.get(ARTICLES_KEY) as Article[] | null;
    console.log(`[KV] Retrieved data type: ${typeof data}, is array: ${Array.isArray(data)}, length: ${Array.isArray(data) ? data.length : 'N/A'}`);
    const result = data ?? [];
    console.log(`[KV] Returning ${result.length} articles`);
    return result;
  } catch (err) {
    console.error("[KV] getArticles failed:", err);
    console.error("[KV] Error details:", JSON.stringify(err, null, 2));
    if (err instanceof Error) {
      console.error("[KV] Error message:", err.message);
      console.error("[KV] Error stack:", err.stack);
    }
    return [];
  }
}

export async function getStats(): Promise<{ count: number; lastUpdated: string | null }> {
  // Build-time guard: skip KV access during build
  if (isBuildPhase()) {
    console.log("[KV] Skipped during build phase");
    return { count: 0, lastUpdated: null };
  }
  
  console.log(`[KV] getStats called`);
  try {
    const articles = await getArticles();
    console.log(`[KV] getStats: Retrieved ${articles.length} articles`);
    
    if (!checkKVConfig()) {
      return { count: 0, lastUpdated: null };
    }
    
    const kvInstance = await getKV();
    if (!kvInstance) {
      return { count: articles.length, lastUpdated: null };
    }
    
    const lastUpdated = await kvInstance.get(LAST_UPDATED_KEY) as string | null;
    console.log(`[KV] getStats: Last updated: ${lastUpdated ?? 'null'}`);
    
    return {
      count: articles.length,
      lastUpdated: lastUpdated ?? null,
    };
  } catch (err) {
    console.error("[KV] getStats failed:", err);
    console.error("[KV] Error details:", JSON.stringify(err, null, 2));
    return { count: 0, lastUpdated: null };
  }
}

export async function getCachedArticles(): Promise<{ articles: Article[]; lastUpdated: string | null }> {
  // Build-time guard: skip KV access during build
  if (isBuildPhase()) {
    console.log("[KV] Skipped during build phase");
    return { articles: [], lastUpdated: null };
  }
  
  const articles = await getArticles();
  
  if (!checkKVConfig()) {
    return { articles: [], lastUpdated: null };
  }
  
  const kvInstance = await getKV();
  if (!kvInstance) {
    return { articles, lastUpdated: null };
  }
  
  try {
    const lastUpdated = await kvInstance.get(LAST_UPDATED_KEY) as string | null;
    return {
      articles,
      lastUpdated: lastUpdated ?? null,
    };
  } catch (err) {
    console.error("[KV] getCachedArticles failed to get lastUpdated:", err);
    return { articles, lastUpdated: null };
  }
}

