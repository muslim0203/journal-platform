import { NextResponse } from "next/server";
import { runFullHarvest } from "@/lib/harvest/runFullHarvest";

export async function GET() {
  try {
    const { count } = await runFullHarvest();
    return NextResponse.json({ status: "ok", count });
  } catch (err) {
    console.error("Cron harvest failed", err);
    return NextResponse.json({ status: "error", count: 0 });
  }
}


