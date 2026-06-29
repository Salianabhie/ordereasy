import { NextRequest, NextResponse } from "next/server";
import { getRestaurantBySlug } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}
