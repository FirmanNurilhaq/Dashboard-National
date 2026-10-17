import { NextRequest, NextResponse } from "next/server";
import { getAreaDistribution } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areas = searchParams.getAll("area");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");

    const workload = getAreaDistribution({
      selectedAreas: areas.length > 0 ? areas : undefined,
      dateRange: { from, to },
      searchQuery: q || undefined,
    });

    return NextResponse.json(workload);
  } catch (error: any) {
    console.error("Error in /api/dashboard/workload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
