import { NextRequest, NextResponse } from "next/server";
import { getPaginatedAssignments } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const sortBy = searchParams.get("sortBy") || "oaDate";
    const sortDir = (searchParams.get("sortDir") || "desc") as "asc" | "desc";

    const areas = searchParams.getAll("area");
    const statuses = searchParams.getAll("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");
    const field = searchParams.get("field");

    const result = getPaginatedAssignments(
      {
        selectedAreas: areas.length > 0 ? areas : undefined,
        selectedStatuses: statuses.length > 0 ? statuses : undefined,
        dateRange: { from, to },
        searchField: (field as any) || "all",
        searchQuery: q || undefined,
      },
      page,
      pageSize,
      sortBy,
      sortDir
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/assignments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
