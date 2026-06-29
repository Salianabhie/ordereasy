export interface UpsellSuggestion {
  itemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  message: string;
  discount: number;
}

const DEFAULT_RULES: Record<string, { tags: string[]; message: string }[]> = {
  burger: [
    { tags: ["fries", "side"], message: "Complete your meal with crispy fries" },
    { tags: ["drink", "beverage"], message: "Add a refreshing drink" },
  ],
  pizza: [
    { tags: ["bread", "side"], message: "Garlic bread pairs perfectly" },
    { tags: ["dessert"], message: "Finish with something sweet" },
  ],
  pasta: [
    { tags: ["bread", "side"], message: "Add garlic bread on the side" },
    { tags: ["drink", "beverage"], message: "Pair with a house wine" },
  ],
  salad: [
    { tags: ["drink", "beverage"], message: "Stay refreshed with a drink" },
    { tags: ["dessert"], message: "Treat yourself to dessert" },
  ],
};

function detectCategory(name: string, tags: string): string {
  const text = `${name} ${tags}`.toLowerCase();
  if (text.includes("burger")) return "burger";
  if (text.includes("pizza")) return "pizza";
  if (text.includes("pasta")) return "pasta";
  if (text.includes("salad")) return "salad";
  return "default";
}

export function getUpsellSuggestions(
  triggerItem: { id: string; name: string; tags: string },
  allItems: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    tags: string;
    isAvailable: boolean;
  }[],
  existingCartIds: string[] = []
): UpsellSuggestion[] {
  const category = detectCategory(triggerItem.name, triggerItem.tags);
  const rules = DEFAULT_RULES[category] ?? [
    { tags: ["drink"], message: "Add a drink to your order" },
    { tags: ["dessert"], message: "Something sweet to finish?" },
  ];

  const suggestions: UpsellSuggestion[] = [];

  for (const rule of rules) {
    const match = allItems.find(
      (item) =>
        item.id !== triggerItem.id &&
        item.isAvailable &&
        !existingCartIds.includes(item.id) &&
        !suggestions.some((s) => s.itemId === item.id) &&
        rule.tags.some((tag) => item.tags.toLowerCase().includes(tag))
    );

    if (match) {
      suggestions.push({
        itemId: match.id,
        name: match.name,
        price: match.price,
        imageUrl: match.imageUrl,
        message: rule.message,
        discount: 0,
      });
    }

    if (suggestions.length >= 2) break;
  }

  return suggestions;
}
