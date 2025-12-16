import { NextResponse } from "next/server";
import { getArticles } from "@/lib/cache/articlesKV";

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json(articles);
  } catch (err) {
    console.error("Articles API failed", err);
    return NextResponse.json([], { status: 500 });
  }
}

