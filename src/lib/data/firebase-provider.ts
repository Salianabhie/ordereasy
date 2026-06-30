import { restaurantRef } from "@/lib/firebase/admin";
import { calculateBill } from "@/lib/billing";
import type {
  AnalyticsData,
  CreateOrderInput,
  CustomizationGroup,
  MenuItem,
  Order,
  Restaurant,
  UpsellRule,
} from "./types";

function sub(slug: string, name: string) {
  return restaurantRef(slug).collection(name);
}

async function assembleRestaurant(
  slug: string,
  includeUnavailable = false
): Promise<Restaurant | null> {
  const doc = await restaurantRef(slug).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  const [categoriesSnap, menuSnap, groupsSnap, optionsSnap, tablesSnap] =
    await Promise.all([
      sub(slug, "categories").orderBy("sortOrder").get(),
      sub(slug, "menuItems").orderBy("sortOrder").get(),
      sub(slug, "customizationGroups").get(),
      sub(slug, "customizationOptions").get(),
      sub(slug, "tables").orderBy("number").get(),
    ]);

  const groups = groupsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
    id: string;
    menuItemId: string;
    name: string;
    required: boolean;
    maxSelect: number;
  }[];

  const options = optionsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
    id: string;
    groupId: string;
    name: string;
    price: number;
  }[];

  const menuItems = menuSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MenuItem & { id: string })
    .filter((m) => includeUnavailable || m.isAvailable !== false)
    .map((item) => ({
      ...item,
      customizationGroups: groups
        .filter((g) => g.menuItemId === item.id)
        .map(
          (g): CustomizationGroup => ({
            id: g.id,
            name: g.name,
            required: g.required,
            maxSelect: g.maxSelect,
            options: options.filter((o) => o.groupId === g.id),
          })
        ),
    }));

  const categories = categoriesSnap.docs.map((d) => {
    const cat = d.data();
    return {
      id: d.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? null,
      imageUrl: cat.imageUrl ?? null,
      sortOrder: cat.sortOrder ?? 0,
      menuItems: menuItems.filter((m) => m.categoryId === d.id),
    };
  });

  const tables = tablesSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Restaurant["tables"];

  return {
    id: slug,
    slug,
    name: data.name,
    description: data.description ?? null,
    logoUrl: data.logoUrl ?? null,
    coverUrl: data.coverUrl ?? null,
    address: data.address ?? null,
    phone: data.phone ?? null,
    currency: data.currency ?? "USD",
    taxRate: data.taxRate ?? 0.08,
    plan: data.plan ?? "pro",
    categories,
    tables,
  };
}

export async function getRestaurantBySlug(
  slug: string
): Promise<Restaurant | null> {
  return assembleRestaurant(slug);
}

export async function getRestaurantForDashboard(slug: string) {
  const doc = await restaurantRef(slug).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return { name: data.name as string, slug, password: data.password as string | null };
}

export async function getMenuCategories(slug: string) {
  const restaurant = await assembleRestaurant(slug, true);
  return restaurant?.categories ?? null;
}

export async function getTables(slug: string) {
  const restaurant = await assembleRestaurant(slug);
  return restaurant?.tables ?? null;
}

export async function getOrders(
  slug: string,
  status?: string | null
): Promise<Order[]> {
  let query = sub(slug, "orders").orderBy("createdAt", "desc").limit(50);
  if (status) {
    query = sub(slug, "orders")
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(50);
  }

  const ordersSnap = await query.get();
  const orders: Order[] = [];

  for (const orderDoc of ordersSnap.docs) {
    const orderData = orderDoc.data();
    const inlineItems = orderData.items as
      | {
          menuItemId: string;
          menuItemName: string;
          quantity: number;
          unitPrice: number;
          customizations?: string;
          notes?: string | null;
        }[]
      | undefined;

    const items = inlineItems
      ? inlineItems.map((item, i) => ({
          id: `${orderDoc.id}-item-${i}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customizations: item.customizations ?? "[]",
          notes: item.notes ?? null,
          menuItemId: item.menuItemId,
          menuItem: { name: item.menuItemName ?? "Item" },
        }))
      : [];

    orders.push({
      id: orderDoc.id,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total,
      notes: orderData.notes ?? null,
      paymentStatus: orderData.paymentStatus ?? "unpaid",
      restaurantId: slug,
      tableId: orderData.tableId ?? null,
      createdAt: orderData.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      updatedAt: orderData.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      items,
      table: orderData.tableNumber
        ? { number: orderData.tableNumber }
        : null,
    });
  }

  return orders;
}

export async function createOrder(
  slug: string,
  input: CreateOrderInput
): Promise<Order | null> {
  const restaurant = await assembleRestaurant(slug);
  if (!restaurant) return null;

  const table = restaurant.tables.find((t) => t.number === input.tableNumber);
  const allItems = restaurant.categories.flatMap((c) => c.menuItems);

  const billItems = input.items.map((item) => {
    const menuItem = allItems.find((m) => m.id === item.menuItemId);
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

  const counterRef = restaurantRef(slug).collection("meta").doc("counters");
  const orderNumber = await restaurantRef(slug).firestore.runTransaction(
    async (tx) => {
      const counterDoc = await tx.get(counterRef);
      const current = counterDoc.exists
        ? (counterDoc.data()?.lastOrderNumber ?? 1000)
        : 1000;
      const next = current + 1;
      tx.set(counterRef, { lastOrderNumber: next }, { merge: true });
      return next;
    }
  );

  const orderRef = sub(slug, "orders").doc();
  const now = new Date();

  await orderRef.set({
    orderNumber,
    status: "pending",
    subtotal: bill.subtotal,
    tax: bill.tax,
    total: bill.total,
    notes: input.notes ?? null,
    paymentStatus: "unpaid",
    tableId: table?.id ?? null,
    tableNumber: table?.number ?? null,
    createdAt: now,
    updatedAt: now,
    items: input.items.map((item) => {
      const menuItem = allItems.find((m) => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        menuItemName: menuItem?.name ?? "Unknown",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customizations: JSON.stringify(item.customizations ?? []),
        notes: item.notes ?? null,
      };
    }),
  });

  return {
    id: orderRef.id,
    orderNumber,
    status: "pending",
    subtotal: bill.subtotal,
    tax: bill.tax,
    total: bill.total,
    notes: input.notes ?? null,
    paymentStatus: "unpaid",
    restaurantId: slug,
    tableId: table?.id ?? null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    items: input.items.map((item, i) => ({
      id: `item-${i}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      customizations: JSON.stringify(item.customizations ?? []),
      notes: item.notes ?? null,
      menuItemId: item.menuItemId,
      menuItem: {
        name:
          allItems.find((m) => m.id === item.menuItemId)?.name ?? "Unknown",
      },
    })),
    table: table ? { number: table.number } : null,
  };
}

export async function updateOrderStatus(
  slug: string,
  orderId: string,
  status: string
): Promise<Order | null> {
  const orderRef = sub(slug, "orders").doc(orderId);
  await orderRef.update({ status, updatedAt: new Date() });

  const orders = await getOrders(slug);
  return orders.find((o) => o.id === orderId) ?? null;
}

export async function getAnalytics(slug: string): Promise<AnalyticsData | null> {
  const orders = await getOrders(slug);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recent = orders.filter(
    (o) => new Date(o.createdAt) >= thirtyDaysAgo
  );

  const totalRevenue = recent.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = recent.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const itemSales: Record<
    string,
    { name: string; count: number; revenue: number }
  > = {};
  for (const order of recent) {
    for (const item of order.items) {
      const key = item.menuItemId;
      if (!itemSales[key]) {
        itemSales[key] = { name: item.menuItem.name, count: 0, revenue: 0 };
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
  for (const order of recent) {
    hourlyData[new Date(order.createdAt).getHours()]++;
  }

  const peakHours = Object.entries(hourlyData)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const dailyRevenue: Record<string, number> = {};
  for (const order of recent) {
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
  const rulesSnap = await sub(slug, "upsellRules")
    .where("triggerItemId", "==", menuItemId)
    .get();

  if (rulesSnap.empty) return [];

  const restaurant = await assembleRestaurant(slug);
  if (!restaurant) return [];

  const allItems = restaurant.categories.flatMap((c) => c.menuItems);

  return rulesSnap.docs
    .map((d) => d.data())
    .map((rule) => {
      const suggested = allItems.find(
        (m) => m.id === rule.suggestedItemId
      );
      if (!suggested) return null;
      return {
        triggerItemId: rule.triggerItemId,
        suggestedItemId: rule.suggestedItemId,
        message: rule.message,
        discount: rule.discount ?? 0,
        suggestedItem: suggested,
      };
    })
    .filter(Boolean) as UpsellRule[];
}

export async function getAllMenuItems(slug: string) {
  const restaurant = await assembleRestaurant(slug);
  if (!restaurant) return [];
  return restaurant.categories.flatMap((c) => c.menuItems);
}

export async function getTriggerMenuItem(slug: string, menuItemId: string) {
  const items = await getAllMenuItems(slug);
  return items.find((m) => m.id === menuItemId) ?? null;
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
}) {
  const docRef = restaurantRef(data.slug);
  const now = new Date();
  const restData = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    logoUrl: data.logoUrl || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80",
    coverUrl: data.coverUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    address: data.address || null,
    phone: data.phone || null,
    password: data.password || null,
    currency: "USD",
    taxRate: 0.0875,
    plan: "pro",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await docRef.set(restData);

  // Create 5 tables in subcollection `tables`
  const batch = docRef.firestore.batch();
  for (let i = 1; i <= 5; i++) {
    const tableRef = docRef.collection("tables").doc(`table-${i}`);
    batch.set(tableRef, {
      number: i,
      qrCode: `${data.slug}-table-${i}`,
      capacity: 4,
      status: "available",
    });
  }
  await batch.commit();

  return { id: data.slug, ...restData };
}

export async function createCategory(
  slug: string,
  data: { name: string; slug: string }
) {
  const docRef = restaurantRef(slug);
  const categoriesCol = docRef.collection("categories");
  const countSnap = await categoriesCol.get();
  const sortOrder = countSnap.size;

  const newCatRef = categoriesCol.doc();
  const catData = {
    name: data.name,
    slug: data.slug,
    sortOrder,
    restaurantId: slug,
  };
  await newCatRef.set(catData);
  return { id: newCatRef.id, ...catData };
}

export async function createMenuItem(
  slug: string,
  data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
  }
) {
  const docRef = restaurantRef(slug);
  const menuItemsCol = docRef.collection("menuItems");
  const countSnap = await menuItemsCol.where("categoryId", "==", data.categoryId).get();
  const sortOrder = countSnap.size;

  const newMenuRef = menuItemsCol.doc();
  const itemData = {
    name: data.name,
    description: data.description || null,
    price: data.price,
    imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    categoryId: data.categoryId,
    isAvailable: true,
    isPopular: false,
    sortOrder,
  };
  await newMenuRef.set(itemData);
  return { id: newMenuRef.id, ...itemData };
}
