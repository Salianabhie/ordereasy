import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPriceSuggestions } from "@/lib/analytics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found", recommendations: [] },
        { status: 404 }
      );
    }

    const recommendations = await getPriceSuggestions(slug);
    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching price suggestions:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, recommendations: [] },
      { status: 500 }
    );
  }
}
