"use client";

import { motion } from "framer-motion";
import { QrCode, Users, Download, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Table {
  id: string;
  number: number;
  qrCode: string;
  capacity: number;
  status: string;
}

interface TablesManagerProps {
  slug: string;
  tables: Table[];
}

const statusStyles: Record<string, string> = {
  available: "border-[#E8FF00]/25 bg-[#E8FF00]/5 text-[#E8FF00]",
  occupied: "border-red-500/25 bg-red-500/5 text-red-400",
  reserved: "border-cyan-500/25 bg-cyan-500/5 text-cyan-400",
};

export function TablesManager({ slug, tables }: TablesManagerProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#E8FF00] font-bold">Floor Operations</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 font-cyber-header">Table QR Codes</h1>
          <p className="text-white/40 text-sm mt-1 font-light">
            Each table has an encrypted ordering path. Download codes to print them for table placements.
          </p>
        </div>
        <Button size="sm" variant="dark" className="border border-white/10 hover:border-[#E8FF00]/30 transition-all text-xs">
          <Download className="w-4 h-4" />
          Export All QRs
        </Button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table, i) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.05 }}
            whileHover={{ y: -6 }}
            className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 hover:border-[#E8FF00]/35 transition-all shadow-xl flex flex-col justify-between h-[360px] group"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-cyber-header text-white">Table {table.number}</h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                    statusStyles[table.status] ?? statusStyles.available
                  }`}
                >
                  {table.status}
                </span>
              </div>
              <p className="text-[11px] text-white/30 font-light mt-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Capacity: {table.capacity} Guests
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="w-full aspect-square rounded-xl bg-white p-4.5 flex flex-col items-center justify-center relative overflow-hidden my-4 group-hover:shadow-2xl group-hover:shadow-[#E8FF00]/5 transition-all">
              <QrCode className="w-20 h-20 text-[#080808]" />
              <div className="text-[9px] text-black/40 mt-3 break-all font-mono font-medium text-center">
                /{slug}/order?table={table.number}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-white/40 font-mono font-semibold uppercase tracking-wider text-[10px]">Ready to print</span>
              <a
                href={`/${slug}/order?table=${table.number}`}
                target="_blank"
                className="text-[#E8FF00] hover:underline font-semibold flex items-center gap-1 transition-all"
              >
                Preview Menu
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
