import { NextRequest, NextResponse } from "next/server";
import { createCategory } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, slug: categorySlug } = body;

    if (!name || !categorySlug) {
      return NextResponse.json(
        { error: "Category name and slug are required" },
        { status: 400 }
      );
    }

    const cleanCatSlug = categorySlug.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const category = await createCategory(slug, {
      name,
      slug: cleanCatSlug,
    });

    if (!category) {
      return NextResponse.json(
        { error: "Restaurant not found or failed to create category" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
