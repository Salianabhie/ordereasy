import { prisma } from "@/lib/prisma";

interface OrderHistory {
  menuItemId: string;
  menuItemName: string;
  category: string;
  orderCount: number;
  lastOrdered: Date;
}

export async function getCustomerRecommendations(
  customerPhone: string,
  restaurantSlug: string
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) return [];

  // Get customer's order history
  const customer = await prisma.customer.findUnique({
    where: { phone: customerPhone },
  });

  if (!customer) return [];

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      customerId: customer.id,
    },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Build order history
  const historyMap = new Map<string, OrderHistory>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = historyMap.get(item.menuItemId);
      if (existing) {
        existing.orderCount += item.quantity;
      } else {
        historyMap.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          menuItemName: item.menuItem.name,
          category: item.menuItem.category.name,
          orderCount: item.quantity,
          lastOrdered: order.createdAt,
        });
      }
    }
  }

  const history = Array.from(historyMap.values());

  // Get all available menu items
  const allMenuItems = await prisma.menuItem.findMany({
    where: {
      restaurantId: restaurant.id,
      isAvailable: true,
    },
    include: {
      category: true,
    },
  });

  // Generate recommendations
  const recommendations = allMenuItems
    .map((item) => {
      const historyItem = history.find((h) => h.menuItemId === item.id);
      const score = calculateRecommendationScore(item, history, historyItem);
      return {
        ...item,
        recommendationScore: score,
        reason: getRecommendationReason(score, historyItem, item),
      };
    })
    .filter((item) => item.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6);

  return recommendations;
}

function calculateRecommendationScore(
  item: any,
  history: OrderHistory[],
  historyItem?: OrderHistory
): number {
  let score = 0;

  // If user has ordered this before, give it a boost
  if (historyItem) {
    score += 20; // Base score for previously ordered
    score += Math.min(historyItem.orderCount * 5, 30); // Up to 30 points for frequency
    score += historyItem.orderCount > 5 ? 10 : 0; // Bonus for frequent orders
  }

  // Recommend items from same categories as user's favorites
  const favoriteCategories = getFavoriteCategories(history);
  if (favoriteCategories.includes(item.category.name)) {
    score += 15;
  }

  // Boost popular items
  if (item.isPopular) {
    score += 10;
  }

  // Boost today's special
  if (item.isTodaySpecial) {
    score += 25;
  }

  return score;
}

function getFavoriteCategories(history: OrderHistory[]): string[] {
  const categoryCount = new Map<string, number>();

  for (const item of history) {
    const count = categoryCount.get(item.category) || 0;
    categoryCount.set(item.category, count + item.orderCount);
  }

  return Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0]);
}

function getRecommendationReason(
  score: number,
  historyItem?: OrderHistory,
  item?: any
): string {
  if (item?.isTodaySpecial) {
    return "Today's Special";
  }

  if (historyItem) {
    if (historyItem.orderCount > 5) {
      return "Your favorite";
    }
    return "Ordered before";
  }

  if (item?.isPopular) {
    return "Popular choice";
  }

  return "Recommended for you";
}
