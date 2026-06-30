import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, type, discountPercent, startTime, endTime, daysOfWeek, menuItemIds } = body;

    if (!name || !type || !startTime || !endTime || !daysOfWeek) {
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

    const promotion = await prisma.promotion.create({
      data: {
        name,
        type,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        startTime,
        endTime,
        daysOfWeek,
        menuItemIds: menuItemIds || "",
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json({ success: true, promotion }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating promotion:", error);
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

    const promotions = await prisma.promotion.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ promotions }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching promotions:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
