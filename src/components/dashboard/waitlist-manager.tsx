"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Bell, Check, X, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaitlistEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  status: string;
  estimatedTime: number | null;
  position: number;
  notified: boolean;
  createdAt: string;
}

interface WaitlistManagerProps {
  restaurantSlug: string;
}

export function WaitlistManager({ restaurantSlug }: WaitlistManagerProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    partySize: 2,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWaitlist();
    const interval = setInterval(fetchWaitlist, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [restaurantSlug]);

  const fetchWaitlist = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/waitlist`);
      const data = await response.json();
      setWaitlist(data.waitlist || []);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchWaitlist();
        setShowAddModal(false);
        setFormData({ customerName: "", customerPhone: "", partySize: 2 });
      }
    } catch (error) {
      console.error("Error adding to waitlist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEstimatedTime = async (id: string, time: number) => {
    try {
      await fetch(`/api/restaurants/${restaurantSlug}/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedTime: time }),
      });
      fetchWaitlist();
    } catch (error) {
      console.error("Error updating wait time:", error);
    }
  };

  const seatCustomer = async (id: string) => {
    try {
      await fetch(`/api/restaurants/${restaurantSlug}/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "seated" }),
      });
      fetchWaitlist();
    } catch (error) {
      console.error("Error seating customer:", error);
    }
  };

  const notifyCustomer = async (id: string) => {
    try {
      await fetch(`/api/restaurants/${restaurantSlug}/waitlist/${id}/notify`, {
        method: "POST",
      });
      fetchWaitlist();
    } catch (error) {
      console.error("Error notifying customer:", error);
    }
  };

  const removeCustomer = async (id: string) => {
    try {
      await fetch(`/api/restaurants/${restaurantSlug}/waitlist/${id}`, {
        method: "DELETE",
      });
      fetchWaitlist();
    } catch (error) {
      console.error("Error removing customer:", error);
    }
  };

  const activeWaitlist = waitlist.filter((w) => w.status === "waiting");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-cyber-header text-white">Waitlist</h2>
          <p className="text-white/50 text-sm">
            {activeWaitlist.length} party{activeWaitlist.length !== 1 ? "ies" : ""} waiting
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Waitlist
        </Button>
      </div>

      {/* Add to Waitlist Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 z-10"
            >
              <h3 className="text-xl font-bold text-white mb-4">Add to Waitlist</h3>
              <form onSubmit={handleAddToWaitlist} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase">
                    Party Size
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, partySize: size })}
                        className={`flex-1 py-3 rounded-lg border transition-all ${
                          formData.partySize === size
                            ? "bg-[#E8FF00] text-black border-[#E8FF00]"
                            : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold"
                  >
                    {isSubmitting ? "Adding..." : "Add"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-12 text-white/50">Loading...</div>
      ) : activeWaitlist.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No one is currently waiting</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeWaitlist.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141414] border border-white/5 rounded-xl p-4 hover:border-[#E8FF00]/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#E8FF00] text-black flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{entry.customerName}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Users className="w-3 h-3" />
                        {entry.partySize} guests
                        <span className="mx-1">•</span>
                        <Clock className="w-3 h-3" />
                        {new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-white/40" />
                    <span className="text-sm text-white/60">{entry.customerPhone}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={entry.estimatedTime || ""}
                      onChange={(e) => updateEstimatedTime(entry.id, parseInt(e.target.value))}
                      placeholder="min"
                      className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm text-center"
                    />
                    <span className="text-xs text-white/50">min</span>
                  </div>

                  <div className="flex gap-1">
                    {!entry.notified && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => notifyCustomer(entry.id)}
                        className="h-8 px-2 text-orange-400 hover:text-orange-300"
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => seatCustomer(entry.id)}
                      className="h-8 px-2 text-green-400 hover:text-green-300"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCustomer(entry.id)}
                      className="h-8 px-2 text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {entry.notified && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <span className="text-xs text-orange-400 flex items-center gap-1">
                    <Bell className="w-3 h-3" /> Notified
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
