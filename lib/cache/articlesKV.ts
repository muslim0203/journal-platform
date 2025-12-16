import { kv } from "@vercel/kv";
import type { Article } from "@/lib/mockArticles";

const ARTICLES_KEY = "articles:data";
const LAST_UPDATED_KEY = "articles:lastUpdated";

// Check if KV environment variables are set
function checkKVConfig() {
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;
  console.log(`[KV] Config check - URL: ${hasUrl ? 'SET' : 'MISSING'}, Token: ${hasToken ? 'SET' : 'MISSING'}`);
  if (!hasUrl || !hasToken) {
    console.error("[KV] Missing environment variables: KV_REST_API_URL or KV_REST_API_TOKEN");
  }
  return hasUrl && hasToken;
}

export async function setArticles(articles: Article[]): Promise<void> {
  console.log(`[KV] setArticles called with ${articles.length} articles`);
  
  if (!checkKVConfig()) {
    throw new Error("KV environment variables not configured");
  }
  
  try {
    console.log(`[KV] Writing to key: ${ARTICLES_KEY}`);
    await kv.set(ARTICLES_KEY, articles);
    console.log(`[KV] Successfully wrote ${articles.length} articles`);
    
    const timestamp = new Date().toISOString();
    console.log(`[KV] Writing timestamp to key: ${LAST_UPDATED_KEY}`);
    await kv.set(LAST_UPDATED_KEY, timestamp);
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
  console.log(`[KV] getArticles called, reading from key: ${ARTICLES_KEY}`);
  
  if (!checkKVConfig()) {
    console.warn("[KV] Environment variables not configured, returning empty array");
    return [];
  }
  
  try {
    const data = await kv.get<Article[]>(ARTICLES_KEY);
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
  console.log(`[KV] getStats called`);
  try {
    const articles = await getArticles();
    console.log(`[KV] getStats: Retrieved ${articles.length} articles`);
    
    const lastUpdated = await kv.get<string>(LAST_UPDATED_KEY);
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
  const articles = await getArticles();
  const lastUpdated = await kv.get<string>(LAST_UPDATED_KEY);
  return {
    articles,
    lastUpdated: lastUpdated ?? null,
  };
}

