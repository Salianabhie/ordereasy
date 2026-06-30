import { prisma } from "@/lib/prisma";

export async function getDynamicPrice(
  menuItemId: string,
  restaurantSlug: string
): Promise<{ price: number; discount: number | null; promotion: any }> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    return { price: 0, discount: null, promotion: null };
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
  });

  if (!menuItem) {
    return { price: 0, discount: null, promotion: null };
  }

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday (0) to 7
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  // Get active promotions
  const promotions = await prisma.promotion.findMany({
    where: {
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  for (const promotion of promotions) {
    // Check if promotion applies to this menu item
    if (promotion.menuItemIds) {
      const applicableIds = promotion.menuItemIds.split(",");
      if (!applicableIds.includes(menuItemId)) {
        continue;
      }
    }

    // Check if current day is in promotion days
    const promotionDays = promotion.daysOfWeek.split(",").map((d) => parseInt(d.trim()));
    if (!promotionDays.includes(currentDay)) {
      continue;
    }

    // Check if current time is within promotion hours
    if (currentTime >= promotion.startTime && currentTime <= promotion.endTime) {
      if (promotion.discountPercent) {
        const discountAmount = menuItem.price * (promotion.discountPercent / 100);
        return {
          price: menuItem.price - discountAmount,
          discount: promotion.discountPercent,
          promotion,
        };
      }
    }
  }

  return { price: menuItem.price, discount: null, promotion: null };
}

export async function getApplicablePromotions(restaurantSlug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) return [];

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);

  const promotions = await prisma.promotion.findMany({
    where: {
      restaurantId: restaurant.id,
      isActive: true,
    },
  });

  return promotions.filter((promotion) => {
    const promotionDays = promotion.daysOfWeek.split(",").map((d) => parseInt(d.trim()));
    const isDayMatch = promotionDays.includes(currentDay);
    const isTimeMatch = currentTime >= promotion.startTime && currentTime <= promotion.endTime;
    return isDayMatch && isTimeMatch;
  });
}
