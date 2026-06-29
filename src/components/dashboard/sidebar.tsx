"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  Menu,
  Monitor,
  Settings,
  Table2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/kitchen", label: "Kitchen", icon: Monitor },
  { href: "/menu", label: "Menu", icon: Menu },
  { href: "/tables", label: "Tables", icon: Table2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

interface NavContentProps {
  slug: string;
  restaurantName: string;
  basePath: string;
  pathname: string;
  setMobileOpen: (open: boolean) => void;
}

function NavContent({
  slug,
  restaurantName,
  basePath,
  pathname,
  setMobileOpen,
}: NavContentProps) {
  return (
    <>
      <div className="p-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8FF00] flex items-center justify-center text-black shadow-lg shadow-[#E8FF00]/10">
            <ChefHat className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white font-cyber-header">OrderEasy</div>
            <div className="text-[10px] text-white/40 truncate max-w-[140px] uppercase tracking-widest font-bold">
              {restaurantName}
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1.5">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === basePath
              : pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block"
            >
              <motion.div
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all relative",
                  isActive
                    ? "bg-[#E8FF00]/5 border border-[#E8FF00]/15 text-white font-semibold"
                    : "text-white/45 hover:text-white/85 hover:bg-white/[0.02] border border-transparent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="absolute left-0 top-3 bottom-3 w-1 bg-[#E8FF00] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#E8FF00]" : "text-white/40")} />
                <span className="font-cyber-data">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-1.5">
        <Link
          href={`/${slug}/order?table=5`}
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-[#E8FF00] hover:bg-[#E8FF00]/5 border border-transparent hover:border-[#E8FF00]/10 transition-all font-medium"
        >
          <Monitor className="w-4 h-4 text-[#E8FF00]" />
          <span className="font-cyber-data">Preview Menu</span>
        </Link>
        <button className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-white/30 hover:text-white/50 transition-all w-full text-left">
          <Settings className="w-4 h-4" />
          <span className="font-cyber-data">Settings</span>
        </button>
      </div>
    </>
  );
}

export function DashboardSidebar({
  slug,
  restaurantName,
}: {
  slug: string;
  restaurantName: string;
}) {
  const pathname = usePathname();
  const basePath = `/dashboard/${slug}`;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed z-40 w-11 h-11 rounded-xl bg-[#0F0F0F] border border-white/5 flex items-center justify-center text-white shadow-xl touch-target press-scale"
        style={{ top: "max(1rem, env(safe-area-inset-top))", left: "max(1rem, env(safe-area-inset-left))" }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-[#0F0F0F] h-screen sticky top-0 shrink-0">
        <NavContent
          slug={slug}
          restaurantName={restaurantName}
          basePath={basePath}
          pathname={pathname}
          setMobileOpen={setMobileOpen}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/75 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 32, stiffness: 400 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[min(280px,85vw)] bg-[#0F0F0F] border-r border-white/5 z-50 flex flex-col gpu-accelerate"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/40"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent
                slug={slug}
                restaurantName={restaurantName}
                basePath={basePath}
                pathname={pathname}
                setMobileOpen={setMobileOpen}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
