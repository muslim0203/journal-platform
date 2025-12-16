import { NextResponse } from "next/server";
import { runFullHarvest } from "@/lib/harvest/runFullHarvest";

export async function POST() {
  console.log("[API] /api/admin/sync POST called");
  try {
    console.log("[API] Starting runFullHarvest...");
    const result = await runFullHarvest();
    console.log(`[API] Harvest completed: count=${result.count}, journals=${result.journals.length}`);
    return NextResponse.json({ success: true, count: result.count });
  } catch (err) {
    console.error("[API] Admin sync failed:", err);
    console.error("[API] Error stack:", err instanceof Error ? err.stack : "No stack");
    return NextResponse.json({ 
      success: false, 
      count: 0,
      error: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}


