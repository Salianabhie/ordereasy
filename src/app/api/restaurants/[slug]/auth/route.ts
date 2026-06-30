import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFirebaseEnabled } from "@/lib/firebase/config";
import { getRestaurantForDashboard } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { password } = body;

    console.log("Auth attempt for slug:", slug);
    console.log("Password provided:", password ? "Yes" : "No");
    console.log("Firebase enabled:", isFirebaseEnabled());

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    let restaurantPassword: string | null = null;

    if (isFirebaseEnabled()) {
      try {
        const restaurant = await getRestaurantForDashboard(slug);
        if (!restaurant) {
          console.error("Restaurant not found in Firebase for slug:", slug);
          return NextResponse.json(
            { error: "Restaurant not found" },
            { status: 404 }
          );
        }
        restaurantPassword = restaurant.password;
        console.log("Firebase restaurant password set:", restaurantPassword ? "Yes" : "No");
      } catch (firebaseError) {
        console.error("Firebase error:", firebaseError);
        return NextResponse.json(
          { error: "Error accessing Firebase database" },
          { status: 500 }
        );
      }
    } else {
      try {
        const restaurant = await prisma.restaurant.findUnique({
          where: { slug },
        });

        console.log("Prisma restaurant found:", restaurant ? "Yes" : "No");
        if (restaurant) {
          restaurantPassword = restaurant.password;
          console.log("Prisma restaurant password set:", restaurantPassword ? "Yes" : "No");
        }

        if (!restaurant) {
          console.error("Restaurant not found in Prisma for slug:", slug);
          return NextResponse.json(
            { error: "Restaurant not found" },
            { status: 404 }
          );
        }
      } catch (prismaError) {
        console.error("Prisma error:", prismaError);
        return NextResponse.json(
          { error: "Error accessing database" },
          { status: 500 }
        );
      }
    }

    // For backward compatibility: if no password is set, allow access
    if (!restaurantPassword) {
      console.log("Restaurant has no password set, allowing access");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (restaurantPassword !== password) {
      console.log("Password mismatch");
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    console.log("Authentication successful");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Authentication error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
