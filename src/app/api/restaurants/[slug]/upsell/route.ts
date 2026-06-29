import { NextRequest, NextResponse } from "next/server";
import {
  getAllMenuItems,
  getTriggerMenuItem,
  getUpsellRules,
} from "@/lib/data";
import { getUpsellSuggestions } from "@/lib/upsell-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { menuItemId, cartItemIds = [] } = await request.json();

  const triggerItem = await getTriggerMenuItem(slug, menuItemId);
  if (!triggerItem) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const dbRules = await getUpsellRules(slug, menuItemId);

  if (dbRules.length > 0) {
    const suggestions = dbRules
      .filter(
        (r) =>
          r.suggestedItem.isAvailable &&
          !cartItemIds.includes(r.suggestedItemId)
      )
      .map((r) => ({
        itemId: r.suggestedItemId,
        name: r.suggestedItem.name,
        price: r.suggestedItem.price,
        imageUrl: r.suggestedItem.imageUrl,
        message: r.message,
        discount: r.discount,
      }));
    return NextResponse.json(suggestions);
  }

  const allItems = await getAllMenuItems(slug);
  const suggestions = getUpsellSuggestions(triggerItem, allItems, cartItemIds);
  return NextResponse.json(suggestions);
}
