import { NextRequest, NextResponse } from "next/server";
import { createMenuItem } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { isFirebaseEnabled } from "@/lib/firebase/config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, description, price, imageUrl, categoryId, isPopular, isTodaySpecial } = body;

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
      isPopular: isPopular === true,
      isTodaySpecial: isTodaySpecial === true,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    if (!isFirebaseEnabled()) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
      });

      if (!restaurant) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }

      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id: itemId,
          restaurantId: restaurant.id,
        },
      });

      if (!menuItem) {
        return NextResponse.json(
          { error: "Menu item not found" },
          { status: 404 }
        );
      }

      await prisma.menuItem.delete({
        where: { id: itemId },
      });
    } else {
      // Firebase implementation
      const { restaurantRef } = await import("@/lib/firebase/admin");
      const restaurant = await restaurantRef(slug).get();
      if (!restaurant.exists) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }

      const menuItemRef = restaurant.ref.collection("menuItems").doc(itemId);
      const menuItemDoc = await menuItemRef.get();
      if (!menuItemDoc.exists) {
        return NextResponse.json(
          { error: "Menu item not found" },
          { status: 404 }
        );
      }

      await menuItemRef.delete();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting menu item:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
