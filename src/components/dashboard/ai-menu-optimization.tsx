"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, DollarSign, AlertTriangle, Lightbulb, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AIRecommendation {
  menuItemId: string;
  menuItemName: string;
  category: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  popularityScore: number;
  trend: "up" | "down" | "stable";
  suggestions: string[];
}

interface AIMenuOptimizationProps {
  restaurantSlug: string;
}

export function AIMenuOptimization({ restaurantSlug }: AIMenuOptimizationProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [restaurantSlug]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/analytics/price-suggestions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-white/40" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-white/40";
    }
  };

  const getActionColor = (suggestion: string) => {
    if (suggestion.includes("increase")) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (suggestion.includes("decrease") || suggestion.includes("lower")) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    if (suggestion.includes("declining")) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-[#E8FF00]/20 text-[#E8FF00] border-[#E8FF00]/30";
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-white/50">
        Loading AI insights...
      </div>
    );
  }

  const itemsWithSuggestions = recommendations.filter((r) => r.suggestions.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-cyber-header text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-[#E8FF00]" />
            AI Menu Optimization
          </h2>
          <p className="text-white/50 text-sm">
            Data-driven insights to maximize your menu performance
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-white/20 transition-all text-sm"
        >
          Refresh
        </button>
      </div>

      {itemsWithSuggestions.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recommendations yet. Need more order data for AI insights.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {itemsWithSuggestions.map((item) => (
            <motion.div
              key={item.menuItemId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141414] border border-white/5 rounded-xl p-5 hover:border-[#E8FF00]/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{item.menuItemName}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/70">
                      {item.category}
                    </span>
                    <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                      {getTrendIcon(item.trend)}
                      <span className="text-xs capitalize">{item.trend}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${item.totalRevenue.toFixed(2)} revenue
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {item.totalOrders} orders
                    </span>
                    <span className="flex items-center gap-1">
                      popularity: {item.popularityScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-[#E8FF00]" />
                  AI Recommendations
                </div>
                <div className="space-y-2">
                  {item.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${getActionColor(suggestion)}`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">All Menu Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-white/50 uppercase tracking-wider">
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Orders</th>
                  <th className="pb-3">Avg Value</th>
                  <th className="pb-3">Popularity</th>
                  <th className="pb-3">Trend</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recommendations.map((item) => (
                  <tr key={item.menuItemId} className="border-t border-white/5">
                    <td className="py-3 text-white">{item.menuItemName}</td>
                    <td className="py-3 text-white/70">${item.totalRevenue.toFixed(2)}</td>
                    <td className="py-3 text-white/70">{item.totalOrders}</td>
                    <td className="py-3 text-white/70">${item.avgOrderValue.toFixed(2)}</td>
                    <td className="py-3 text-white/70">{item.popularityScore.toFixed(1)}%</td>
                    <td className={`py-3 ${getTrendColor(item.trend)} capitalize`}>
                      {item.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
