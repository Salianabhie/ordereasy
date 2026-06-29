"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { animate } from "framer-motion";

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  createdAt: string;
  table: { number: number } | null;
  items: { quantity: number; menuItem: { name: string } }[];
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueChart: { date: string; revenue: number }[];
}

const statusColors: Record<string, string> = {
  pending: "text-amber-400 bg-amber-500/10 border border-amber-500/25",
  preparing: "text-cyan-400 bg-cyan-500/10 border border-cyan-500/25",
  ready: "text-[#E8FF00] bg-[#E8FF00]/10 border border-[#E8FF00]/25",
  completed: "text-white/40 bg-white/5 border border-white/10",
};

// ─── COUNT UP COMPONENT ──────────────────────────────────────────────────
function CountUp({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplayValue(latest);
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  const formatted = prefix + Math.floor(displayValue).toLocaleString() + suffix;
  return <span className="font-mono font-bold tracking-tight text-white">{formatted}</span>;
}

export function DashboardOverview({ slug }: { slug: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [ordersRes, analyticsRes] = await Promise.all([
          fetch(`/api/restaurants/${slug}/orders`),
          fetch(`/api/restaurants/${slug}/analytics`),
        ]);
        const o = await ordersRes.json();
        const a = await analyticsRes.json();
        if (active) {
          setOrders(o);
          setAnalytics(a);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [slug]);

  const activeOrders = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  );

  const stats = [
    {
      label: "Gross Revenue (30d)",
      value: analytics?.totalRevenue ?? 0,
      prefix: "$",
      change: "+12.5%",
    },
    {
      label: "Active Orders",
      value: activeOrders.length,
      prefix: "",
      change: "Live Sync",
    },
    {
      label: "Average Basket",
      value: analytics?.avgOrderValue ?? 0,
      prefix: "$",
      change: "+8.2%",
    },
    {
      label: "Total Orders",
      value: analytics?.totalOrders ?? 0,
      prefix: "",
      change: "30 days",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#E8FF00] font-bold">Performance Matrix</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 font-cyber-header">
            Executive Summary
          </h1>
        </div>
        <div className="text-xs text-white/40 font-mono">
          Live Updates Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.06 }}
            className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 shadow-xl relative overflow-hidden group hover:border-[#E8FF00]/25 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8FF00]/2 rounded-full filter blur-2xl group-hover:bg-[#E8FF00]/5 transition-colors" />
            <div className="text-xs font-bold uppercase tracking-wider text-white/40">{stat.label}</div>
            <div className="text-3xl font-bold mt-3 tracking-tight">
              <CountUp value={stat.value} prefix={stat.prefix} />
            </div>
            <div className="mt-2 text-xs flex items-center gap-1.5 text-[#E8FF00]">
              {stat.change === "Live Sync" ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF00] animate-ping" />
                  <span>Live Sync</span>
                </div>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stat.change}</span>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tables and Quick Actions */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Live Orders Table */}
        <div className="lg:col-span-3">
          <Card className="bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4.5 border-b border-white/5 px-0 pt-0">
              <CardTitle className="text-base font-bold font-cyber-header text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8FF00]" />
                Live Order Queue
              </CardTitle>
              <Link
                href={`/dashboard/${slug}/kitchen`}
                className="text-xs text-[#E8FF00] flex items-center gap-1 hover:underline font-semibold"
              >
                Kitchen display <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <div className="space-y-3 mt-4">
              {activeOrders.slice(0, 6).map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-white/5 hover:border-[#E8FF00]/15 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-white/80 font-mono">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <div className="text-sm text-white/90 font-medium">
                        Table {order.table?.number ?? "—"} ·{" "}
                        <span className="text-white/55 text-xs">
                          {order.items
                            .map((i) => `${i.quantity}x ${i.menuItem.name}`)
                            .join(", ")}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/35 flex items-center gap-1 mt-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#E8FF00]" />
                        {formatTime(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                        statusColors[order.status] ?? statusColors.pending
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-sm font-mono text-white/90">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {activeOrders.length === 0 && (
                <div className="text-center py-16 text-white/30 text-sm font-light">
                  No active orders — waiting for customers.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
            <CardHeader className="pb-4 border-b border-white/5 px-0 pt-0">
              <CardTitle className="text-base font-bold font-cyber-header text-white">System Navigator</CardTitle>
            </CardHeader>
            <div className="space-y-2.5 mt-4">
              {[
                {
                  label: "Manage Menu Catalog",
                  href: `/dashboard/${slug}/menu`,
                  desc: "Edit items, pricing, and categories",
                },
                {
                  label: "Executive Analytics",
                  href: `/dashboard/${slug}/analytics`,
                  desc: "Revenue trends and product insights",
                },
                {
                  label: "Generate Table QRs",
                  href: `/dashboard/${slug}/tables`,
                  desc: "Manage floor layouts and print codes",
                },
                {
                  label: "Live Storefront Preview",
                  href: `/${slug}/order?table=5`,
                  desc: "View the customer ordering journey",
                  external: true,
                },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  className="block"
                >
                  <motion.div
                    whileHover={{ x: 6, borderColor: "rgba(232, 255, 0, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl bg-[#141414] border border-white/5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white/95 group-hover:text-[#E8FF00] transition-colors">
                          {action.label}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5 font-light">
                          {action.desc}
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-[#E8FF00] transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
