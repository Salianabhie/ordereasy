import { prisma } from "@/lib/prisma";
import { calculateBill } from "@/lib/billing";
import type {
  AnalyticsData,
  CreateOrderInput,
  Order,
  Restaurant,
  UpsellRule,
} from "./types";

export async function getRestaurantBySlug(
  slug: string
): Promise<Restaurant | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
            include: {
              customizationGroups: { include: { options: true } },
            },
          },
        },
      },
      tables: { orderBy: { number: "asc" } },
    },
  });

  return restaurant as Restaurant | null;
}

export async function getRestaurantForDashboard(
  slug: string
): Promise<{ name: string; slug: string; password: string | null } | null> {
  const r = await prisma.restaurant.findUnique({
    where: { slug },
    select: { name: true, slug: true, password: true },
  });
  return r ? { name: r.name, slug: r.slug, password: r.password } : null;
}

export async function getMenuCategories(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { menuItems: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  return restaurant?.categories ?? null;
}

export async function getTables(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { tables: { orderBy: { number: "asc" } } },
  });
  return restaurant?.tables ?? null;
}

export async function getOrders(
  slug: string,
  status?: string | null
): Promise<Order[]> {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return [];

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      ...(status ? { status } : {}),
    },
    include: {
      items: { include: { menuItem: true } },
      table: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return orders as Order[];
}

export async function createOrder(
  slug: string,
  input: CreateOrderInput
): Promise<Order | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { tables: true },
  });
  if (!restaurant) return null;

  const table = restaurant.tables.find((t) => t.number === input.tableNumber);
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: input.items.map((i) => i.menuItemId) },
      restaurantId: restaurant.id,
    },
  });

  const billItems = input.items.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    const customTotal =
      (item.customizations as { price: number }[] | undefined)?.reduce(
        (s, c) => s + c.price,
        0
      ) ?? 0;
    return {
      name: menuItem?.name ?? "Unknown",
      quantity: item.quantity,
      unitPrice: (menuItem?.price ?? 0) + customTotal,
    };
  });

  const bill = calculateBill(billItems, restaurant.taxRate);
  const lastOrder = await prisma.order.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { orderNumber: "desc" },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: (lastOrder?.orderNumber ?? 1000) + 1,
      status: "pending",
      subtotal: bill.subtotal,
      tax: bill.tax,
      total: bill.total,
      notes: input.notes,
      restaurantId: restaurant.id,
      tableId: table?.id,
      items: {
        create: input.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customizations: JSON.stringify(item.customizations ?? []),
          notes: item.notes,
        })),
      },
    },
    include: {
      items: { include: { menuItem: true } },
      table: true,
    },
  });

  return order as Order;
}

export async function updateOrderStatus(
  slug: string,
  orderId: string,
  status: string
): Promise<Order | null> {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return null;

  const order = await prisma.order.update({
    where: { id: orderId, restaurantId: restaurant.id },
    data: { status },
    include: {
      items: { include: { menuItem: true } },
      table: true,
    },
  });

  return order as Order;
}

export async function getAnalytics(slug: string): Promise<AnalyticsData | null> {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const itemSales: Record<
    string,
    { name: string; count: number; revenue: number }
  > = {};
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.menuItemId;
      if (!itemSales[key]) {
        itemSales[key] = {
          name: item.menuItem.name,
          count: 0,
          revenue: 0,
        };
      }
      itemSales[key].count += item.quantity;
      itemSales[key].revenue += item.unitPrice * item.quantity;
    }
  }

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const lowItems = Object.values(itemSales)
    .sort((a, b) => a.count - b.count)
    .slice(0, 5);

  const hourlyData: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyData[i] = 0;
  for (const order of orders) {
    hourlyData[new Date(order.createdAt).getHours()]++;
  }

  const peakHours = Object.entries(hourlyData)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dailyRevenue: Record<string, number> = {};
  for (const order of orders) {
    const day = new Date(order.createdAt).toISOString().split("T")[0];
    dailyRevenue[day] = (dailyRevenue[day] ?? 0) + order.total;
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    topItems,
    lowItems,
    peakHours,
    revenueChart: Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100,
      })),
    hourlyData: Object.entries(hourlyData).map(([hour, count]) => ({
      hour: `${hour}:00`,
      orders: count,
    })),
  };
}

export async function getUpsellRules(
  slug: string,
  menuItemId: string
): Promise<UpsellRule[]> {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return [];

  const rules = await prisma.upsellRule.findMany({
    where: { triggerItemId: menuItemId },
    include: { suggestedItem: true },
  });

  return rules.map((r) => ({
    triggerItemId: r.triggerItemId,
    suggestedItemId: r.suggestedItemId,
    message: r.message,
    discount: r.discount,
    suggestedItem: {
      ...r.suggestedItem,
      customizationGroups: [],
    } as UpsellRule["suggestedItem"],
  }));
}

export async function getAllMenuItems(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return [];

  return prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id, isAvailable: true },
  });
}

export async function getTriggerMenuItem(slug: string, menuItemId: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return null;

  return prisma.menuItem.findFirst({
    where: { id: menuItemId, restaurantId: restaurant.id },
  });
}

export async function createRestaurant(data: {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  address?: string;
  phone?: string;
  password?: string;
  latitude?: number;
  longitude?: number;
  locationRadius?: number;
}) {
  const restaurant = await prisma.restaurant.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      logoUrl: data.logoUrl || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80",
      coverUrl: data.coverUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      address: data.address,
      phone: data.phone,
      password: data.password,
      latitude: data.latitude,
      longitude: data.longitude,
      locationRadius: data.locationRadius || 100,
      taxRate: 0.0875,
      plan: "pro",
      tables: {
        create: Array.from({ length: 5 }, (_, i) => ({
          number: i + 1,
          qrCode: `${data.slug}-table-${i + 1}`,
          capacity: 4,
          status: "available",
        })),
      },
    },
  });
  return restaurant;
}

export async function createCategory(
  slug: string,
  data: { name: string; slug: string }
) {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return null;

  const count = await prisma.category.count({ where: { restaurantId: restaurant.id } });

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      sortOrder: count,
      restaurantId: restaurant.id,
    },
  });
  return category;
}

export async function createMenuItem(
  slug: string,
  data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
    isPopular?: boolean;
    isTodaySpecial?: boolean;
  }
) {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return null;

  const count = await prisma.menuItem.count({
    where: { categoryId: data.categoryId, restaurantId: restaurant.id },
  });

  const menuItem = await prisma.menuItem.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
      categoryId: data.categoryId,
      restaurantId: restaurant.id,
      sortOrder: count,
      isPopular: data.isPopular || false,
      isTodaySpecial: data.isTodaySpecial || false,
    },
  });
  return menuItem;
}
