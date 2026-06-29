import { NextRequest, NextResponse } from "next/server";
import { createMenuItem } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, description, price, imageUrl, categoryId } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Item name, price, and category are required" },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }

    const menuItem = await createMenuItem(slug, {
      name,
      description: description || undefined,
      price: parsedPrice,
      imageUrl: imageUrl || undefined,
      categoryId,
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Restaurant not found or failed to create menu item" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, menuItem }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating menu item:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
