import { NextRequest, NextResponse } from "next/server";
import { getSuggestions } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const field = (searchParams.get("field") || "all") as any;
    const query = searchParams.get("q") || "";

    const suggestions = getSuggestions(field, query, 8);
    return NextResponse.json(suggestions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
