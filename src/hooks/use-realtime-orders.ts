"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import type { Order } from "@/lib/data/types";

export function useRealtimeOrders(slug: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtime] = useState(() => {
    if (typeof window === "undefined") return false;
    const db = getClientDb();
    return !!(db && isFirebaseClientConfigured());
  });

  useEffect(() => {
    const db = getClientDb();

    if (db && isFirebaseClientConfigured()) {
      const q = query(
        collection(db, "restaurants", slug, "orders"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const parsed: Order[] = snapshot.docs.map((orderDoc) => {
          const data = orderDoc.data();
          const inlineItems = (data.items ?? []) as {
            menuItemId: string;
            menuItemName: string;
            quantity: number;
            unitPrice: number;
            customizations?: string;
            notes?: string | null;
          }[];

          return {
            id: orderDoc.id,
            orderNumber: data.orderNumber,
            status: data.status,
            subtotal: data.subtotal,
            tax: data.tax,
            total: data.total,
            notes: data.notes ?? null,
            paymentStatus: data.paymentStatus ?? "unpaid",
            restaurantId: slug,
            tableId: data.tableId ?? null,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString() ??
              new Date().toISOString(),
            updatedAt:
              data.updatedAt?.toDate?.()?.toISOString() ??
              new Date().toISOString(),
            items: inlineItems.map((item, i) => ({
              id: `${orderDoc.id}-${i}`,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              customizations: item.customizations ?? "[]",
              notes: item.notes ?? null,
              menuItemId: item.menuItemId,
              menuItem: { name: item.menuItemName ?? "Item" },
            })),
            table: data.tableNumber ? { number: data.tableNumber } : null,
          };
        });

        setOrders(parsed);
        setLoading(false);
      });

      return () => unsub();
    }

    const fetchOrders = async () => {
      const res = await fetch(`/api/restaurants/${slug}/orders`);
      setOrders(await res.json());
      setLoading(false);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  return { orders, loading, isRealtime };
}
