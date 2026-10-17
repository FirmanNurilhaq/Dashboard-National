import { NextRequest, NextResponse } from "next/server";
import { getMapSitePoints } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areas = searchParams.getAll("area");
    const statuses = searchParams.getAll("status");
    const limit = parseInt(searchParams.get("limit") || "4000", 10);

    const points = getMapSitePoints(
      {
        selectedAreas: areas.length > 0 ? areas : undefined,
        selectedStatuses: statuses.length > 0 ? statuses : undefined,
      },
      limit
    );

    return NextResponse.json(points);
  } catch (error: any) {
    console.error("Error in /api/dashboard/map-points:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
