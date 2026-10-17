import { NextResponse } from "next/server";
import { getAvailableAreas } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const areas = getAvailableAreas();
    const statuses = ["Acc", "Not Yet Acc", "Reject"];
    return NextResponse.json({
      areas,
      statuses,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
