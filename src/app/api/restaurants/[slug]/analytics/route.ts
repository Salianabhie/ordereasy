import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const analytics = await getAnalytics(slug);

  if (!analytics) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json(analytics);
}
