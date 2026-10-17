import { NextRequest, NextResponse } from "next/server";
import { getKpiSummary } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areas = searchParams.getAll("area");
    const statuses = searchParams.getAll("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");
    const field = searchParams.get("field");

    const kpi = getKpiSummary({
      selectedAreas: areas.length > 0 ? areas : undefined,
      selectedStatuses: statuses.length > 0 ? statuses : undefined,
      dateRange: { from, to },
      searchField: (field as any) || "all",
      searchQuery: q || undefined,
    });

    return NextResponse.json(kpi);
  } catch (error: any) {
    console.error("Error in /api/dashboard/kpi:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
