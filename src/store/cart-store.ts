"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartCustomization {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  customizations: CartCustomization[];
  notes: string;
}

interface CartStore {
  items: CartItem[];
  restaurantSlug: string | null;
  tableNumber: number | null;
  addItem: (item: Omit<CartItem, "cartId">) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  updateNotes: (cartId: string, notes: string) => void;
  clearCart: () => void;
  setContext: (slug: string, table: number) => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantSlug: null,
      tableNumber: null,

      addItem: (item) => {
        const cartId = `${item.menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          items: [...state.items, { ...item, cartId }],
        }));
      },

      removeItem: (cartId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartId !== cartId),
        })),

      updateQuantity: (cartId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.cartId !== cartId)
              : state.items.map((i) =>
                  i.cartId === cartId ? { ...i, quantity } : i
                ),
        })),

      updateNotes: (cartId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.cartId === cartId ? { ...i, notes } : i
          ),
        })),

      clearCart: () => set({ items: [], restaurantSlug: null, tableNumber: null }),

      setContext: (slug, table) =>
        set({ restaurantSlug: slug, tableNumber: table }),

      total: () =>
        get().items.reduce((sum, item) => {
          const customTotal = item.customizations.reduce(
            (s, c) => s + c.price,
            0
          );
          return sum + (item.price + customTotal) * item.quantity;
        }, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "ordereasy-cart" }
  )
);
