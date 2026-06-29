import { isFirebaseEnabled } from "@/lib/firebase/config";
import * as firebase from "./firebase-provider";
import * as prisma from "./prisma-provider";

export type { AnalyticsData, CreateOrderInput, Order, Restaurant } from "./types";

function provider() {
  return isFirebaseEnabled() ? firebase : prisma;
}

export const getDataProvider = () =>
  isFirebaseEnabled() ? ("firebase" as const) : ("prisma" as const);

export const getRestaurantBySlug = (...args: Parameters<typeof prisma.getRestaurantBySlug>) =>
  provider().getRestaurantBySlug(...args);

export const getRestaurantForDashboard = (
  ...args: Parameters<typeof prisma.getRestaurantForDashboard>
) => provider().getRestaurantForDashboard(...args);

export const getMenuCategories = (...args: Parameters<typeof prisma.getMenuCategories>) =>
  provider().getMenuCategories(...args);

export const getTables = (...args: Parameters<typeof prisma.getTables>) =>
  provider().getTables(...args);

export const getOrders = (...args: Parameters<typeof prisma.getOrders>) =>
  provider().getOrders(...args);

export const createOrder = (...args: Parameters<typeof prisma.createOrder>) =>
  provider().createOrder(...args);

export const updateOrderStatus = (
  ...args: Parameters<typeof prisma.updateOrderStatus>
) => provider().updateOrderStatus(...args);

export const getAnalytics = (...args: Parameters<typeof prisma.getAnalytics>) =>
  provider().getAnalytics(...args);

export const getUpsellRules = (...args: Parameters<typeof prisma.getUpsellRules>) =>
  provider().getUpsellRules(...args);

export const getAllMenuItems = (...args: Parameters<typeof prisma.getAllMenuItems>) =>
  provider().getAllMenuItems(...args);

export const getTriggerMenuItem = (
  ...args: Parameters<typeof prisma.getTriggerMenuItem>
) => provider().getTriggerMenuItem(...args);

export const createRestaurant = (
  ...args: Parameters<typeof prisma.createRestaurant>
) => provider().createRestaurant(...args);

export const createCategory = (
  ...args: Parameters<typeof prisma.createCategory>
) => provider().createCategory(...args);

export const createMenuItem = (
  ...args: Parameters<typeof prisma.createMenuItem>
) => provider().createMenuItem(...args);
