import { promises as fs } from "fs";
import path from "path";
import type { Article } from "@/lib/mockArticles";

type CacheShape = {
  lastUpdated: string | null;
  articles: Article[];
};

const memory: CacheShape = { lastUpdated: null, articles: [] };
const cacheFile = path.join(process.cwd(), ".next", "cache", "articles.json");

async function readFromDisk(): Promise<CacheShape | null> {
  try {
    const data = await fs.readFile(cacheFile, "utf8");
    const parsed = JSON.parse(data);
    if (parsed && Array.isArray(parsed.articles)) {
      return {
        lastUpdated: parsed.lastUpdated ?? null,
        articles: parsed.articles,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeToDisk(payload: CacheShape) {
  try {
    await fs.mkdir(path.dirname(cacheFile), { recursive: true });
    await fs.writeFile(cacheFile, JSON.stringify(payload), "utf8");
  } catch {
    // ignore disk errors
  }
}

export async function getCachedArticles(): Promise<CacheShape> {
  if (memory.articles.length) return memory;
  const disk = await readFromDisk();
  if (disk) {
    memory.articles = disk.articles;
    memory.lastUpdated = disk.lastUpdated;
    return memory;
  }
  return memory;
}

export async function setCachedArticles(articles: Article[]) {
  const payload: CacheShape = {
    lastUpdated: new Date().toISOString(),
    articles,
  };
  memory.articles = payload.articles;
  memory.lastUpdated = payload.lastUpdated;
  await writeToDisk(payload);
}


