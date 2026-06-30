import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, phone, email, partySize, date, time, specialRequests } = body;

    if (!name || !phone || !partySize || !date || !time) {
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

    const reservation = await prisma.reservation.create({
      data: {
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        partySize: parseInt(partySize),
        date: new Date(date),
        time,
        specialRequests: specialRequests || null,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json({ success: true, reservation }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating reservation:", error);
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

    const reservations = await prisma.reservation.findMany({
      where: {
        restaurantId: restaurant.id,
        date: {
          gte: new Date(),
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching reservations:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
