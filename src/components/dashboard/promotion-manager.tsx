"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Clock, Percent, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Promotion {
  id: string;
  name: string;
  type: string;
  discountPercent: number | null;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
  menuItemIds: string;
  isActive: boolean;
}

interface PromotionManagerProps {
  restaurantSlug: string;
}

export function PromotionManager({ restaurantSlug }: PromotionManagerProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "happy_hour",
    discountPercent: 20,
    startTime: "17:00",
    endTime: "19:00",
    daysOfWeek: "1,2,3,4,5",
    menuItemIds: "",
  });

  useEffect(() => {
    fetchPromotions();
  }, [restaurantSlug]);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/promotions`);
      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingPromotion
      ? `/api/restaurants/${restaurantSlug}/promotions/${editingPromotion.id}`
      : `/api/restaurants/${restaurantSlug}/promotions`;

    const method = editingPromotion ? "PATCH" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      fetchPromotions();
      setShowModal(false);
      setEditingPromotion(null);
      setFormData({
        name: "",
        type: "happy_hour",
        discountPercent: 20,
        startTime: "17:00",
        endTime: "19:00",
        daysOfWeek: "1,2,3,4,5",
        menuItemIds: "",
      });
    } catch (error) {
      console.error("Error saving promotion:", error);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/restaurants/${restaurantSlug}/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchPromotions();
    } catch (error) {
      console.error("Error toggling promotion:", error);
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await fetch(`/api/restaurants/${restaurantSlug}/promotions/${id}`, {
        method: "DELETE",
      });
      fetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
    }
  };

  const editPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      type: promotion.type,
      discountPercent: promotion.discountPercent || 20,
      startTime: promotion.startTime,
      endTime: promotion.endTime,
      daysOfWeek: promotion.daysOfWeek,
      menuItemIds: promotion.menuItemIds,
    });
    setShowModal(true);
  };

  const daysMap: Record<string, string> = {
    "1": "Mon",
    "2": "Tue",
    "3": "Wed",
    "4": "Thu",
    "5": "Fri",
    "6": "Sat",
    "7": "Sun",
  };

  const formatDays = (days: string) => {
    return days
      .split(",")
      .map((d) => daysMap[d.trim()])
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-cyber-header text-white">Promotions</h2>
          <p className="text-white/50 text-sm">
            Manage happy hours, discounts, and special offers
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPromotion(null);
            setFormData({
              name: "",
              type: "happy_hour",
              discountPercent: 20,
              startTime: "17:00",
              endTime: "19:00",
              daysOfWeek: "1,2,3,4,5",
              menuItemIds: "",
            });
            setShowModal(true);
          }}
          className="bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Promotion
        </Button>
      </div>

      <div className="grid gap-4">
        {promotions.map((promotion) => (
          <motion.div
            key={promotion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#141414] border rounded-xl p-4 ${
              promotion.isActive
                ? "border-[#E8FF00]/30"
                : "border-white/5 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">{promotion.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/70">
                    {promotion.type.replace("_", " ")}
                  </span>
                  {!promotion.isActive && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  {promotion.discountPercent && (
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {promotion.discountPercent}% off
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {promotion.startTime} - {promotion.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {formatDays(promotion.daysOfWeek)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleActive(promotion.id, promotion.isActive)}
                  className="h-8 px-2"
                >
                  {promotion.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editPromotion(promotion)}
                  className="h-8 px-2"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deletePromotion(promotion.id)}
                  className="h-8 px-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 z-10">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingPromotion ? "Edit Promotion" : "Add Promotion"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  placeholder="Happy Hour"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                >
                  <option value="happy_hour">Happy Hour</option>
                  <option value="discount">Discount</option>
                  <option value="special">Special Offer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase">
                  Discount Percent
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercent: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase">
                  Days of Week (1=Mon, 7=Sun)
                </label>
                <input
                  type="text"
                  required
                  value={formData.daysOfWeek}
                  onChange={(e) => setFormData({ ...formData, daysOfWeek: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  placeholder="1,2,3,4,5"
                />
                <p className="text-xs text-white/40">Comma-separated: 1,2,3,4,5 for weekdays</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase">
                  Menu Item IDs (optional)
                </label>
                <input
                  type="text"
                  value={formData.menuItemIds}
                  onChange={(e) => setFormData({ ...formData, menuItemIds: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  placeholder="Leave empty for all items"
                />
                <p className="text-xs text-white/40">Comma-separated IDs, or empty for all menu items</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold"
                >
                  {editingPromotion ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
