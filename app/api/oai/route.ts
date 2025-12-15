import { NextResponse } from "next/server";
import { getCachedArticles } from "@/lib/cache/articlesCache";

export async function GET() {
  const cache = await getCachedArticles();
  return NextResponse.json(cache.articles ?? []);
}


