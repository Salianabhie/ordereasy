import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { customerName, customerPhone, partySize } = body;

    if (!customerName || !customerPhone || !partySize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Get current position in waitlist
    const currentPosition = await prisma.waitlist.count({
      where: {
        restaurantId: restaurant.id,
        status: "waiting",
      },
    });

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        customerName,
        customerPhone,
        partySize: parseInt(partySize),
        position: currentPosition + 1,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json({ success: true, waitlistEntry }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error adding to waitlist:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const waitlist = await prisma.waitlist.findMany({
      where: {
        restaurantId: restaurant.id,
        status: "waiting",
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ waitlist }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching waitlist:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
