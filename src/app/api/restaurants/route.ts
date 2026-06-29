import { NextRequest, NextResponse } from "next/server";
import { getRestaurantBySlug, createRestaurant } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, address, phone, logoUrl, coverUrl } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Restaurant name and URL slug are required" },
        { status: 400 }
      );
    }

    // Clean slug to contain only letters, numbers, and hyphens
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    // Check if slug is already taken
    const existing = await getRestaurantBySlug(cleanSlug);
    if (existing) {
      return NextResponse.json(
        { error: "Restaurant URL slug is already taken" },
        { status: 400 }
      );
    }

    const restaurant = await createRestaurant({
      name,
      slug: cleanSlug,
      description: description || undefined,
      address: address || undefined,
      phone: phone || undefined,
      logoUrl: logoUrl || undefined,
      coverUrl: coverUrl || undefined,
    });

    return NextResponse.json({ success: true, restaurant }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error registering restaurant:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
