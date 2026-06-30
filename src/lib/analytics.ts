import { prisma } from "@/lib/prisma";

export interface MenuItemAnalytics {
  menuItemId: string;
  menuItemName: string;
  category: string;
  totalOrders: number;
  totalQuantity: number;
  totalRevenue: number;
  avgOrderValue: number;
  popularityScore: number;
  profitMargin: number;
  last30DaysOrders: number;
  trend: "up" | "down" | "stable";
}

export async function getMenuAnalytics(restaurantSlug: string): Promise<MenuItemAnalytics[]> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      createdAt: { gte: thirtyDaysAgo },
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
  });

  const analyticsMap = new Map<string, MenuItemAnalytics>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = analyticsMap.get(item.menuItemId);
      
      if (existing) {
        existing.totalOrders += 1;
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.unitPrice * item.quantity;
        existing.last30DaysOrders += 1;
      } else {
        analyticsMap.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          menuItemName: item.menuItem.name,
          category: item.menuItem.category.name,
          totalOrders: 1,
          totalQuantity: item.quantity,
          totalRevenue: item.unitPrice * item.quantity,
          avgOrderValue: item.unitPrice,
          popularityScore: 0,
          profitMargin: 0.7, // Assumed 70% margin
          last30DaysOrders: 1,
          trend: "stable",
        });
      }
    }
  }

  const analytics = Array.from(analyticsMap.values());

  // Calculate popularity score and trend
  const totalMenuItems = analytics.length;
  const avgOrders = analytics.reduce((sum, a) => sum + a.totalOrders, 0) / (totalMenuItems || 1);

  for (const item of analytics) {
    item.avgOrderValue = item.totalRevenue / item.totalOrders;
    item.popularityScore = (item.totalOrders / (totalMenuItems || 1)) * 100;
    
    // Simple trend calculation
    if (item.totalOrders > avgOrders * 1.2) {
      item.trend = "up";
    } else if (item.totalOrders < avgOrders * 0.8) {
      item.trend = "down";
    }
  }

  return analytics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export async function getPriceSuggestions(restaurantSlug: string) {
  const analytics = await getMenuAnalytics(restaurantSlug);
  
  return analytics.map((item) => {
    const suggestions: string[] = [];
    
    // High popularity, low price - suggest increase
    if (item.popularityScore > 15 && item.avgOrderValue < 20) {
      suggestions.push("Consider increasing price by 10-15% due to high demand");
    }
    
    // Low popularity, high price - suggest decrease
    if (item.popularityScore < 5 && item.avgOrderValue > 30) {
      suggestions.push("Consider lowering price or running a promotion to boost sales");
    }
    
    // Declining trend
    if (item.trend === "down") {
      suggestions.push("Sales declining - consider promotional pricing or menu placement");
    }
    
    // High margin, low volume
    if (item.profitMargin > 0.8 && item.totalOrders < 5) {
      suggestions.push("High margin but low volume - consider featuring prominently");
    }
    
    return {
      ...item,
      suggestions,
    };
  });
}

export async function getRestaurantRevenue(restaurantSlug: string, days: number = 30) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) return { total: 0, orders: 0, avgOrderValue: 0 };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      createdAt: { gte: startDate },
    },
  });

  const total = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = orders.length > 0 ? total / orders.length : 0;

  return {
    total,
    orders: orders.length,
    avgOrderValue,
  };
}
