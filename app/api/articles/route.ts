import { NextResponse } from "next/server";
import { harvestOjsArticles } from "@/lib/oai/harvestOjs";

export async function GET() {
  try {
    const articles = await harvestOjsArticles({ limit: 100 });
    return NextResponse.json(articles);
  } catch (err) {
    console.error("Articles API failed", err);
    return NextResponse.json([], { status: 500 });
  }
}


