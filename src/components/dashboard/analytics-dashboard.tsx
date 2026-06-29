"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { animate } from "framer-motion";

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topItems: { name: string; count: number; revenue: number }[];
  lowItems: { name: string; count: number; revenue: number }[];
  peakHours: { hour: number; count: number }[];
  revenueChart: { date: string; revenue: number }[];
  hourlyData: { hour: string; orders: number }[];
}

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

export function AnalyticsDashboard({ slug }: { slug: string }) {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${slug}/analytics`)
      .then((r) => r.json())
      .then(setData);
  }, [slug]);

  if (!data) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#0F0F0F] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: data.totalRevenue,
      prefix: "$",
      icon: DollarSign,
      change: "+12.5%",
    },
    {
      label: "Total Orders",
      value: data.totalOrders,
      prefix: "",
      icon: ShoppingBag,
      change: "+8.2%",
    },
    {
      label: "Avg Order Value",
      value: data.avgOrderValue,
      prefix: "$",
      icon: TrendingUp,
      change: "+5.1%",
    },
    {
      label: "Peak Hour",
      value: data.peakHours[0]?.hour ?? 18,
      prefix: "",
      suffix: ":00",
      icon: Users,
      change: `${data.peakHours[0]?.count ?? 0} orders`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#E8FF00] font-bold">Data Intelligence</span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 font-cyber-header">Business Analytics</h1>
        <p className="text-white/40 text-sm mt-1 font-light">
          Real-time performance indicators and sales distribution metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.06 }}
            className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 shadow-xl relative overflow-hidden group hover:border-[#E8FF00]/25 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8FF00]/2 rounded-full filter blur-2xl group-hover:bg-[#E8FF00]/5 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-[#E8FF00]" />
            </div>
            <div className="text-3xl font-bold mt-2 tracking-tight">
              {stat.label === "Peak Hour" ? (
                <span className="font-mono font-bold tracking-tight text-white">
                  {stat.value}{stat.suffix}
                </span>
              ) : (
                <CountUp value={stat.value} prefix={stat.prefix} />
              )}
            </div>
            <div className="mt-2 text-xs text-[#E8FF00] font-mono">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold font-cyber-header text-white">Revenue Timeline</CardTitle>
          </CardHeader>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8FF00" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#E8FF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F0F0F",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E8FF00"
                  fill="url(#revenueGrad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold font-cyber-header text-white">Load Distribution by Hour</CardTitle>
          </CardHeader>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyData.filter((_, i) => i >= 10 && i <= 22)}>
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F0F0F",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="orders" fill="#E8FF00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Best Sellers and Low Performers */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold font-cyber-header text-white">Top Performing Dishes</CardTitle>
          </CardHeader>
          <div className="space-y-3.5 mt-4">
            {data.topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-[#E8FF00] w-5">0{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white/95">{item.name}</div>
                  <div className="text-[11px] text-white/35 font-light mt-0.5">
                    {item.count} Orders · {formatCurrency(item.revenue)} Gross
                  </div>
                </div>
                <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#E8FF00]"
                    style={{
                      width: `${(item.count / (data.topItems[0]?.count || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {data.topItems.length === 0 && (
              <p className="text-white/30 text-sm font-light py-4">No item metrics compiled yet.</p>
            )}
          </div>
        </Card>

        <Card className="bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold font-cyber-header text-white">Low Rotation Warning</CardTitle>
          </CardHeader>
          <div className="space-y-3.5 mt-4">
            {data.lowItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#141414] border border-white/5"
              >
                <div>
                  <div className="text-sm font-semibold text-white/95">{item.name}</div>
                  <div className="text-[11px] text-white/35 mt-0.5 font-light">
                    {item.count} Sales · Review pricing or placement
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                  Review
                </span>
              </div>
            ))}
            {data.lowItems.length === 0 && (
              <p className="text-white/30 text-sm font-light py-4">No rotation warnings active.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
