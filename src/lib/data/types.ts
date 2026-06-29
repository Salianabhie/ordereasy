export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isPopular: boolean;
  prepTime: number;
  sortOrder: number;
  tags: string;
  categoryId: string;
  customizationGroups: CustomizationGroup[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  menuItems: MenuItem[];
}

export interface Table {
  id: string;
  number: number;
  qrCode: string;
  capacity: number;
  status: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  address: string | null;
  phone: string | null;
  currency: string;
  taxRate: number;
  plan: string;
  categories: Category[];
  tables: Table[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  customizations: string;
  notes: string | null;
  menuItemId: string;
  menuItem: { name: string };
}

export interface Order {
  id: string;
  orderNumber: number;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  paymentStatus: string;
  restaurantId: string;
  tableId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderItem[];
  table: { number: number } | null;
}

export interface CreateOrderInput {
  tableNumber: number;
  items: {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    customizations?: unknown[];
    notes?: string;
  }[];
  notes?: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topItems: { name: string; count: number; revenue: number }[];
  lowItems: { name: string; count: number; revenue: number }[];
  peakHours: { hour: number; count: number }[];
  revenueChart: { date: string; revenue: number }[];
  hourlyData: { hour: string; orders: number }[];
}

export interface UpsellRule {
  triggerItemId: string;
  suggestedItemId: string;
  message: string;
  discount: number;
  suggestedItem: MenuItem;
}
