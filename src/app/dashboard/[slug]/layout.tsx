"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Lock, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const slug = pathname.split('/')[2];
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>("");

  useEffect(() => {
    const auth = localStorage.getItem(`auth_${slug}`);
    if (auth === "true") {
      setIsAuthenticated(true);
      setShowAuthModal(false);
    }
  }, [slug]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/restaurants/${slug}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      localStorage.setItem(`auth_${slug}`, "true");
      setIsAuthenticated(true);
      setShowAuthModal(false);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#E8FF00]/5 rounded-full filter blur-[120px] opacity-60" />
          <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-[#9B7EDE]/5 rounded-full filter blur-[100px] opacity-40" />
        </div>

        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md bg-[#0F0F0F]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl relative z-10"
            >
              <div className="flex items-center gap-3 justify-center mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#E8FF00] flex items-center justify-center text-black shadow-lg shadow-[#E8FF00]/10">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight font-cyber-header text-white">Dashboard Access</span>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight font-cyber-header text-white mb-2">
                  {restaurantName || "Restaurant Dashboard"}
                </h1>
                <p className="text-white/50 text-sm font-light font-cyber-data">
                  Enter your password to access the dashboard
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 font-cyber-data"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50 font-cyber-header">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your dashboard password"
                    className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/25 transition-all text-sm text-white placeholder-white/20 font-cyber-data"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#E8FF00] hover:bg-[#E8FF00]/95 !text-black font-bold uppercase tracking-wider text-sm shadow-xl shadow-[#E8FF00]/10 flex items-center justify-center gap-2 hover:shadow-[#E8FF00]/20 active:scale-98 transition-all rounded-xl font-cyber-data disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Access Dashboard"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen-safe bg-[#080808] text-white flex font-cyber-data">
      <DashboardSidebar slug={slug} restaurantName={restaurantName} />
      <main className="flex-1 min-w-0">
        <div className="pt-16 lg:pt-0 px-4 sm:px-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
