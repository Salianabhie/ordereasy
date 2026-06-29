"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { CheckCircle2, Flame, AlertCircle, Radio, ArrowRight } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRealtimeOrders } from "@/hooks/use-realtime-orders";

const statusConfig: Record<
  string,
  { label: string; color: string; next?: string; nextLabel?: string }
> = {
  pending: {
    label: "New Ticket",
    color: "border-amber-500/25 bg-amber-500/5 text-amber-400",
    next: "preparing",
    nextLabel: "Start Cooking",
  },
  preparing: {
    label: "Cooking",
    color: "border-cyan-500/25 bg-cyan-500/5 text-cyan-400",
    next: "ready",
    nextLabel: "Mark Ready",
  },
  ready: {
    label: "Ready",
    color: "border-[#E8FF00]/25 bg-[#E8FF00]/5 text-[#E8FF00]",
    next: "completed",
    nextLabel: "Complete",
  },
  completed: {
    label: "Completed",
    color: "border-white/10 bg-white/5 text-white/50",
  },
};

export function KitchenDisplay({ slug }: { slug: string }) {
  const { orders, isRealtime } = useRealtimeOrders(slug);
  const [filter, setFilter] = useState("active");

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/restaurants/${slug}/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
  };

  const filtered = orders.filter((o) => {
    if (filter === "active") return !["completed", "cancelled"].includes(o.status);
    return o.status === filter;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;

  const handleDragEnd = async (orderId: string, info: PanInfo, nextStatus?: string) => {
    // If dragged right past 120px threshold, advance status
    if (info.offset.x > 120 && nextStatus) {
      await updateStatus(orderId, nextStatus);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#E8FF00] font-bold">Production Control</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 font-cyber-header">Kitchen Display System (KDS)</h1>
          <p className="text-white/40 text-sm mt-1 flex items-center gap-2 font-light">
            {isRealtime ? (
              <>
                <Radio className="w-4 h-4 text-[#E8FF00] animate-pulse" />
                Live Sync Enabled via Firestore
              </>
            ) : (
              "Polling mode active · Real-time updates every 5s"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            {pendingCount} New
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            {preparingCount} Cooking
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
        {[
          { key: "active", label: "Active Queue" },
          { key: "pending", label: "New" },
          { key: "preparing", label: "Cooking" },
          { key: "ready", label: "Ready" },
        ].map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="kitchen-active-pill"
                  className="absolute inset-0 bg-[#E8FF00] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${isActive ? "text-black" : "text-white/50 hover:text-white/80"}`}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((order) => {
            const config = statusConfig[order.status] ?? statusConfig.pending;

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                drag="x"
                dragConstraints={{ left: 0, right: 150 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => handleDragEnd(order.id, info, config.next)}
                whileDrag={{ scale: 1.03, zIndex: 30, boxShadow: "0 20px 40px rgba(0,0,0,0.8)" }}
                className={cn(
                  "rounded-2xl border p-5 bg-[#0F0F0F] relative overflow-hidden flex flex-col justify-between h-[250px] cursor-grab active:cursor-grabbing transition-colors select-none",
                  config.color
                )}
              >
                {/* Drag Indicator Backdrop Hint */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-10 pointer-events-none transition-opacity text-[#E8FF00] flex flex-col items-center">
                  <ArrowRight className="w-6 h-6 animate-pulse" />
                  <span className="text-[8px] uppercase tracking-widest mt-1">Swipe to Advance</span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-extrabold tracking-tight font-mono">#{order.orderNumber}</div>
                      <div className="text-xs text-white/45 mt-0.5 font-light">
                        Table {order.table?.number ?? "—"} · {formatTime(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                      {config.label}
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-4 max-h-[110px] overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-white/85">
                        <span className="font-medium">{item.menuItem.name}</span>
                        <span className="font-bold text-[#E8FF00] font-mono">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-white/5 mt-3">
                  <span className="font-bold text-sm font-mono text-white">{formatCurrency(order.total)}</span>
                  {config.next && (
                    <button
                      onClick={() => updateStatus(order.id, config.next!)}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#E8FF00]/30 hover:bg-[#E8FF00]/5 text-[#E8FF00] text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      {config.nextLabel}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 bg-[#0F0F0F] border border-white/5 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-white/20" />
          <p className="text-white/40 text-sm font-light">All clear — no orders in this queue.</p>
        </div>
      )}
    </div>
  );
}
