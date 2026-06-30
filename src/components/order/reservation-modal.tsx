"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
}

export function ReservationModal({ isOpen, onClose, restaurantSlug }: ReservationModalProps) {
  const [step, setStep] = useState<"details" | "confirmation">("details");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    partySize: 2,
    date: "",
    time: "",
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStep("confirmation");
      }
    } catch (error) {
      console.error("Reservation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30"
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white/70"
            >
              <X className="w-5 h-5" />
            </button>

            {step === "details" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold font-cyber-header text-white mb-2">
                    Reserve a Table
                  </h2>
                  <p className="text-white/50 text-sm">
                    Book your table in advance
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                        Email (optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                        placeholder="john@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Party Size
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> Date
                      </label>
                      <input
                        type="date"
                        required
                        min={today}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Time
                      </label>
                      <select
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      Special Requests (optional)
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      placeholder="Any dietary restrictions, celebrations, etc."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white h-20 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Reservation"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Reservation Confirmed!</h3>
                <p className="text-white/50 text-sm mb-6">
                  We'll send you a confirmation shortly
                </p>
                <Button onClick={onClose} className="bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold">
                  Done
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
