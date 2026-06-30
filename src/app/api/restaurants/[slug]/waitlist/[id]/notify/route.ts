import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id },
    });

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      );
    }

    // In production, this would send an SMS or push notification
    // For now, we'll just mark as notified
    await prisma.waitlist.update({
      where: { id },
      data: { notified: true },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error notifying customer:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
