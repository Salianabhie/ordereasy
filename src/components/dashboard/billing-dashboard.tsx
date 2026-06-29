"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Receipt, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { animate } from "framer-motion";

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: string;
  createdAt: string;
  table: { number: number } | null;
  items: {
    quantity: number;
    unitPrice: number;
    menuItem: { name: string };
  }[];
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

export function BillingDashboard({ slug }: { slug: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${slug}/orders`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        if (data.length > 0) setSelectedOrder(data[0]);
      });
  }, [slug]);

  const totalBilled = orders.reduce((s, o) => s + o.total, 0);
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#E8FF00] font-bold">Accounts Ledger</span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 font-cyber-header">Billing & Invoices</h1>
        <p className="text-white/40 text-sm mt-1 font-light">
          Track transaction states, compile invoice receipts, and register customer payments.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          {
            label: "Total Billed",
            value: totalBilled,
            prefix: "$",
            icon: Receipt,
          },
          {
            label: "Processed Orders",
            value: orders.length,
            prefix: "",
            icon: CreditCard,
          },
          {
            label: "Settle Rate",
            value: `${paidOrders}/${orders.length}`,
            prefix: "",
            icon: CheckCircle2,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.06 }}
            className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 shadow-xl relative overflow-hidden group hover:border-[#E8FF00]/25 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8FF00]/10 border border-[#E8FF00]/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-[#E8FF00]" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/40">{stat.label}</div>
                <div className="text-2xl font-bold mt-1 tracking-tight">
                  {typeof stat.value === "string" ? (
                    <span className="font-mono font-bold tracking-tight text-white">{stat.value}</span>
                  ) : (
                    <CountUp value={stat.value} prefix={stat.prefix} />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Order History Panel */}
        <Card className="lg:col-span-2 bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold font-cyber-header text-white">Billing History</CardTitle>
          </CardHeader>
          <div className="space-y-2 mt-4 max-h-[500px] overflow-y-auto pr-1">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                  selectedOrder?.id === order.id
                    ? "bg-[#E8FF00]/5 border-[#E8FF00]/20"
                    : "hover:bg-white/[0.02] border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-mono text-white/90">
                    INV-{order.orderNumber}
                  </span>
                  <span className="font-bold text-sm font-mono text-[#E8FF00]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <div className="text-[10px] text-white/35 mt-1 font-mono font-light">
                  Table {order.table?.number ?? "—"} ·{" "}
                  {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Invoice Details Panel */}
        <Card className="lg:col-span-3 bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-white/5">
            <CardTitle className="text-base font-bold font-cyber-header text-white">Bill Details</CardTitle>
          </CardHeader>
          {selectedOrder ? (
            <div className="mt-4">
              <div className="flex items-center justify-between pb-4.5 border-b border-white/5">
                <div>
                  <div className="text-lg font-bold font-mono text-white/90">
                    INV-{selectedOrder.orderNumber}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5 font-light">
                    Table {selectedOrder.table?.number ?? "—"} ·{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border ${
                    selectedOrder.paymentStatus === "paid"
                      ? "border-[#E8FF00]/35 text-[#E8FF00] bg-[#E8FF00]/5"
                      : "border-red-500/35 text-red-400 bg-red-500/5"
                  }`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5 my-6 max-h-[220px] overflow-y-auto pr-1">
                {selectedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs text-white/85"
                  >
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="font-mono text-white/60">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-4 border-t border-white/5 text-xs">
                <div className="flex justify-between text-white/45 font-light">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/45 font-light">
                  <span>Tax</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 text-[#E8FF00]">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {selectedOrder.paymentStatus !== "paid" && (
                <Button
                  onClick={async () => {
                    await fetch(`/api/restaurants/${slug}/orders`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orderId: selectedOrder.id,
                        paymentStatus: "paid",
                      }),
                    });
                    setSelectedOrder((prev) =>
                      prev ? { ...prev, paymentStatus: "paid" } : null
                    );
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.id === selectedOrder.id ? { ...o, paymentStatus: "paid" } : o
                      )
                    );
                  }}
                  className="w-full mt-6 !py-3.5 bg-transparent border border-[#E8FF00]/30 hover:border-[#E8FF00]/55 text-[#E8FF00] hover:bg-[#E8FF00]/5 font-bold uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  Settle Bill
                </Button>
              )}
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-16 font-light">
              Select an invoice to view transaction details.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
