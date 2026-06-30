import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFirebaseEnabled } from "@/lib/firebase/config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; itemId: string }> }
) {
  try {
    const { slug, itemId } = await params;
    const body = await request.json();
    const { name, description, price, imageUrl, isPopular, isTodaySpecial } = body;

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

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (isPopular !== undefined) updateData.isPopular = isPopular;
      if (isTodaySpecial !== undefined) updateData.isTodaySpecial = isTodaySpecial;

      const updatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: updateData,
      });

      return NextResponse.json({ success: true, menuItem: updatedItem }, { status: 200 });
    } else {
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

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (isPopular !== undefined) updateData.isPopular = isPopular;
      if (isTodaySpecial !== undefined) updateData.isTodaySpecial = isTodaySpecial;

      await menuItemRef.update(updateData);
      const updatedDoc = await menuItemRef.get();

      return NextResponse.json({ success: true, menuItem: { id: updatedDoc.id, ...updatedDoc.data() } }, { status: 200 });
    }
  } catch (error: unknown) {
    console.error("Error updating menu item:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; itemId: string }> }
) {
  try {
    const { slug, itemId } = await params;

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
