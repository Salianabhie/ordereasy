"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
  Star,
  MapPin,
  Phone,
  Clock,
  ChevronDown,
  ChefHat,
  Utensils,
  Check,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Mic,
  Globe,
  Lightbulb,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UpsellSuggestion } from "@/lib/upsell-engine";
import { getUserLocation, isWithinRadius } from "@/lib/geolocation";
import { ReservationModal } from "@/components/order/reservation-modal";
import { VoiceOrder } from "@/components/order/voice-order";

interface CustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelect: number;
  options: { id: string; name: string; price: number }[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
  isTodaySpecial: boolean;
  tags: string;
  customizationGroups: CustomizationGroup[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  menuItems: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  taxRate: number;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationRadius?: number;
  categories: Category[];
}

interface ItemModalProps {
  item: MenuItem;
  slug: string;
  onClose: () => void;
}

function ItemModal({ item, slug, onClose }: ItemModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selections, setSelections] = useState<
    Record<string, { name: string; price: number }[]>
  >({});
  const [upsells, setUpsells] = useState<UpsellSuggestion[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleOption = (
    groupId: string,
    groupName: string,
    option: { name: string; price: number },
    maxSelect: number
  ) => {
    setSelections((prev) => {
      const current = prev[groupId] ?? [];
      const exists = current.some((o) => o.name === option.name);
      if (exists) {
        return { ...prev, [groupId]: current.filter((o) => o.name !== option.name) };
      }
      if (maxSelect === 1) {
        return { ...prev, [groupId]: [{ name: option.name, price: option.price }] };
      }
      if (current.length >= maxSelect) return prev;
      return {
        ...prev,
        [groupId]: [...current, { name: option.name, price: option.price }],
      };
    });
  };

  const customizations = Object.entries(selections).flatMap(([groupId, opts]) => {
    const group = item.customizationGroups.find((g) => g.id === groupId);
    return opts.map((o) => ({
      groupName: group?.name ?? "",
      optionName: o.name,
      price: o.price,
    }));
  });

  const customTotal = customizations.reduce((s, c) => s + c.price, 0);
  const itemTotal = (item.price + customTotal) * quantity;

  const handleAdd = async () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity,
      customizations,
      notes,
    });

    const res = await fetch(`/api/restaurants/${slug}/upsell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menuItemId: item.id,
        cartItemIds: [...cartItems.map((i) => i.menuItemId), item.id],
      }),
    });
    const suggestions = await res.json();
    if (suggestions.length > 0) {
      setUpsells(suggestions);
      setShowUpsell(true);
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 420 }}
        className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto rounded-t-[1.75rem] sm:rounded-3xl bg-[#0F0F0F] text-white border border-white/5 shadow-2xl gpu-accelerate overscroll-contain"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {item.imageUrl && (
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="512px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-black/50" />
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-black/75 backdrop-blur flex items-center justify-center border border-white/10 hover:bg-black transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {item.isPopular && (
              <span className="absolute top-5 left-5 flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-[#E8FF00] text-black text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                <Star className="w-3.5 h-3.5 fill-black" />
                Popular Choice
              </span>
            )}
          </div>
        )}

        {!item.imageUrl && (
          <div className="p-6 pb-2 flex justify-between items-start">
            <div className="w-8" />
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-[#141414] flex items-center justify-center border border-white/5 shadow-sm hover:border-[#E8FF00]/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {showUpsell ? (
              <motion.div
                key="upsell"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="py-2"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8FF00]/10 border border-[#E8FF00]/20 flex items-center justify-center text-[#E8FF00]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-cyber-header tracking-tight">Complete your pairing</h3>
                    <p className="text-xs text-white/50 font-cyber-data">
                      Chef recommendations designed to complement your choice
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 mt-6">
                  {upsells.map((upsell) => (
                    <motion.button
                      key={upsell.itemId}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        addItem({
                          menuItemId: upsell.itemId,
                          name: upsell.name,
                          price: upsell.price,
                          imageUrl: upsell.imageUrl,
                          quantity: 1,
                          customizations: [],
                          notes: "",
                        });
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 p-3.5 bg-[#141414] rounded-2xl border border-white/5 hover:border-[#E8FF00]/40 hover:bg-[#E8FF00]/5 transition-all text-left shadow-sm"
                    >
                      {upsell.imageUrl && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5">
                          <Image
                            src={upsell.imageUrl}
                            alt={upsell.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white font-cyber-header">{upsell.name}</div>
                        <div className="text-xs text-white/50 mt-0.5 line-clamp-2 font-cyber-data">{upsell.message}</div>
                      </div>
                      <div className="text-sm font-extrabold text-[#E8FF00] shrink-0 pl-2 font-cyber-data">
                        +{formatCurrency(upsell.price)}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="w-full mt-6 py-4 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 text-white transition-colors font-cyber-data"
                >
                  No thanks, proceed to menu
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold font-cyber-header tracking-tight text-white">
                      {item.name}
                    </h2>
                    <div className="text-lg font-bold text-[#E8FF00] mt-1.5 font-cyber-data">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                </div>

                {item.description && (
                  <p className="text-white/60 mt-3.5 text-sm leading-relaxed font-light font-cyber-data">
                    {item.description}
                  </p>
                )}

                <div className="cyber-divider my-6" />

                {item.customizationGroups.map((group) => (
                  <div key={group.id} className="mt-6 first:mt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold text-sm font-cyber-header uppercase tracking-wider text-white">
                        {group.name}
                      </h4>
                      {group.required && (
                        <span className="text-[9px] font-extrabold text-black bg-[#E8FF00] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {group.options.map((option) => {
                        const selected = (selections[group.id] ?? []).some(
                          (o) => o.name === option.name
                        );
                        return (
                          <button
                            key={option.id}
                            onClick={() =>
                              toggleOption(
                                group.id,
                                group.name,
                                option,
                                group.maxSelect
                              )
                            }
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                              selected
                                ? "border-[#E8FF00] bg-[#E8FF00]/5 shadow-sm"
                                : "border-white/5 bg-[#141414] hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-[#E8FF00] bg-[#E8FF00] text-black" : "border-white/20"}`}>
                                {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-sm font-medium text-white font-cyber-data">{option.name}</span>
                            </div>
                            {option.price > 0 && (
                              <span className="text-xs text-white/50 font-semibold font-cyber-data">
                                +{formatCurrency(option.price)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="mt-6">
                  <h4 className="font-bold text-sm font-cyber-header uppercase tracking-wider text-white mb-2.5">
                    Special Instructions
                  </h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., allergies, no onions, extra sauce..."
                    className="w-full p-4 rounded-2xl bg-[#141414] border border-white/5 text-sm resize-none h-24 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/20 text-white placeholder-white/30 font-cyber-data"
                  />
                </div>

                <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/5 gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-11 h-11 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold w-6 text-center font-cyber-header">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-11 h-11 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    onClick={handleAdd}
                    className="flex-1 !py-3.5 bg-[#E8FF00] hover:bg-[#E8FF00]/95 !text-black font-bold uppercase tracking-wider text-xs shadow-xl shadow-[#E8FF00]/10 rounded-xl font-cyber-data"
                  >
                    Add to order · {formatCurrency(itemTotal)}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface OrderMenuProps {
  restaurant: Restaurant;
  tableNumber: number;
}

interface PlacedOrderTracker {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
}

export function OrderMenu({ restaurant, tableNumber }: OrderMenuProps) {
  const [activeCategory, setActiveCategory] = useState(
    restaurant.categories[0]?.slug ?? ""
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { total, itemCount, setContext, getItemQuantity, getItemCartId, updateQuantity, addItem } = useCartStore();
  const [showCart, setShowCart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [locationVerified, setLocationVerified] = useState<boolean | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [activeOrders, setActiveOrders] = useState<PlacedOrderTracker[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(`active_orders_${restaurant.slug}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [language, setLanguage] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setContext(restaurant.slug, tableNumber);
  }, [restaurant.slug, tableNumber, setContext]);

  // Check user location if restaurant has location restrictions
  useEffect(() => {
    if (!restaurant.latitude || !restaurant.longitude) {
      setLocationVerified(true); // No location restriction set
      return;
    }

    const checkLocation = async () => {
      setIsCheckingLocation(true);
      setLocationError(null);

      try {
        const position = await getUserLocation();
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        if (restaurant.latitude && restaurant.longitude) {
          const withinRadius = isWithinRadius(
            userLat,
            userLon,
            restaurant.latitude,
            restaurant.longitude,
            restaurant.locationRadius ?? 100
          );

          setLocationVerified(withinRadius);
          
          if (!withinRadius) {
            setLocationError("You are outside the restaurant's service area. This app can only be used within the restaurant premises.");
          }
        } else {
          setLocationVerified(true);
        }
      } catch (error) {
        setLocationError(error instanceof Error ? error.message : "Failed to verify location");
        setLocationVerified(false);
      } finally {
        setIsCheckingLocation(false);
      }
    };

    checkLocation();
  }, [restaurant.latitude, restaurant.longitude, restaurant.locationRadius]);

  // Poll order status for active orders
  useEffect(() => {
    if (activeOrders.length === 0) return;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/restaurants/${restaurant.slug}/orders`);
        if (!res.ok) return;
        const orders = (await res.json()) as { id: string; status: string }[];
        
        const updatedOrders = activeOrders.map(activeOrder => {
          const matching = orders.find((o) => o.id === activeOrder.id);
          if (matching && matching.status !== activeOrder.status) {
            return { ...activeOrder, status: matching.status };
          }
          return activeOrder;
        });
        
        // Remove completed/cancelled orders after delay
        const toRemove = updatedOrders.filter(o => ["completed", "cancelled"].includes(o.status));
        if (toRemove.length > 0) {
          setTimeout(() => {
            setActiveOrders(prev => prev.filter(o => !toRemove.find(r => r.id === o.id)));
            localStorage.setItem(`active_orders_${restaurant.slug}`, JSON.stringify(
              updatedOrders.filter(o => !toRemove.find(r => r.id === o.id))
            ));
          }, 6000);
        }
        
        setActiveOrders(updatedOrders);
        localStorage.setItem(`active_orders_${restaurant.slug}`, JSON.stringify(updatedOrders));
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [activeOrders, restaurant.slug]);

  const activeItems =
    restaurant.categories.find((c) => c.slug === activeCategory)?.menuItems ??
    [];

  // Separate today's special, popular (featured) and standard items
  const todaySpecialItems = activeItems.filter((i) => i.isTodaySpecial);
  const featuredItems = activeItems.filter((i) => i.isPopular && !i.isTodaySpecial);
  const standardItems = activeItems.filter((i) => !i.isPopular && !i.isTodaySpecial);

  // Block access if location verification failed
  if (locationVerified === false) {
    return (
      <div className="min-h-screen-safe bg-cyber-mesh text-white font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="flex items-start gap-3 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-red-400 font-bold text-lg mb-2">Location Restricted</h4>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{locationError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-red-400 text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-safe bg-cyber-mesh text-white font-sans">
      {/* Cover Header */}
      <div className="relative h-48 sm:h-56 md:h-64 bg-[#0F0F0F] overflow-hidden border-b border-white/5">
        {restaurant.coverUrl && (
          <Image
            src={restaurant.coverUrl}
            alt={restaurant.name}
            fill
            className="object-cover opacity-20"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-black/60" />
        
        {/* Table Badge */}
        <div
          className="absolute z-20 glass-cyber rounded-xl px-3.5 sm:px-4.5 py-2 border border-[#E8FF00]/20 text-[10px] font-bold text-[#E8FF00] tracking-widest uppercase font-cyber-header"
          style={{ top: "max(1rem, env(safe-area-inset-top))", right: "max(1rem, env(safe-area-inset-right))" }}
        >
          Table {tableNumber}
        </div>

        <div
          className="absolute z-20 flex gap-2"
          style={{ top: "max(1rem, env(safe-area-inset-top))", left: "max(1rem, env(safe-area-inset-left))" }}
        >
          <button
            onClick={() => setShowReservationModal(true)}
            className="glass-cyber rounded-xl px-3 py-2 border border-white/20 text-white/70 hover:text-white hover:border-white/30 transition-all"
            title="Reserve a table"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="glass-cyber rounded-xl px-2 py-2 border border-white/20 text-white/70 bg-transparent text-xs"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
            <option value="de">DE</option>
            <option value="zh">ZH</option>
            <option value="ja">JA</option>
          </select>
        </div>

        <div className="absolute bottom-0 inset-x-0 px-4 sm:p-6 z-10 flex flex-col justify-end pb-4 sm:pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {restaurant.logoUrl && (
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl overflow-hidden border-2 border-[#E8FF00] shrink-0 shadow-lg shadow-[#E8FF00]/5 bg-[#080808]">
                <Image
                  src={restaurant.logoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <button
                type="button"
                className="flex items-center gap-2 w-full text-left touch-target"
                onClick={() => setShowInfo(!showInfo)}
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-cyber-header text-cyber-glow truncate">
                  {restaurant.name}
                </h1>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-[#E8FF00] shrink-0 transition-transform duration-200 ${showInfo ? "rotate-180" : ""}`} />
              </button>
              <p className="text-white/60 text-xs font-light mt-1 flex items-center gap-1 font-cyber-data">
                <MapPin className="w-3.5 h-3.5 text-[#E8FF00]" /> Modern QR Dining
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Restaurant Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#0F0F0F] border-b border-white/5 text-white/80"
          >
            <div className="p-6 grid gap-4 max-w-2xl mx-auto text-sm font-light font-cyber-data">
              {restaurant.description && (
                <p className="text-white/70 text-xs italic font-cyber-header leading-relaxed mb-1">
                  &ldquo;{restaurant.description}&rdquo;
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {restaurant.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#E8FF00] shrink-0" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#E8FF00] shrink-0" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#E8FF00] shrink-0" />
                  <span>Open 11:30 AM - 10:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <Utensils className="w-4 h-4 text-[#E8FF00] shrink-0" />
                  <span>Dine-in QR Service</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Placed Order Trackers */}
      {activeOrders.length > 0 && (
        <div className="px-4 pt-4 max-w-2xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {activeOrders.map((activeOrder) => (
                <div
                  key={activeOrder.id}
                  className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/80 text-white min-w-[280px] snap-center flex-shrink-0"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-[#E8FF00]" />
                      <span className="font-bold font-cyber-header text-sm">Order #{activeOrder.orderNumber}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border ${
                      activeOrder.status === "pending"
                        ? "border-amber-400 text-amber-400 bg-amber-400/5"
                        : activeOrder.status === "preparing"
                        ? "border-cyan-400 text-cyan-400 bg-cyan-400/5"
                        : activeOrder.status === "ready"
                        ? "border-[#E8FF00] text-[#E8FF00] bg-[#E8FF00]/5"
                        : "border-white/10 text-white/30 bg-white/5"
                    }`}>
                      {activeOrder.status === "pending" && "Pending"}
                      {activeOrder.status === "preparing" && "Cooking"}
                      {activeOrder.status === "ready" && "Ready"}
                      {activeOrder.status === "completed" && "Done"}
                    </span>
                  </div>
                  
                  {/* Process Line Tracker */}
                  <div className="flex items-center justify-between gap-1 mt-4 px-2">
                    {[
                      { step: "Sent", active: true },
                      { step: "Cooking", active: ["preparing", "ready", "completed"].includes(activeOrder.status) },
                      { step: "Ready", active: ["ready", "completed"].includes(activeOrder.status) },
                      { step: "Served", active: activeOrder.status === "completed" },
                    ].map((s, idx, arr) => (
                      <div key={s.step} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${s.active ? "bg-[#E8FF00] text-black border-[#E8FF00]" : "border-white/10 bg-white/5 text-white/30"}`}>
                            {idx + 1}
                          </div>
                          <span className="text-[10px] mt-1 font-light text-white/45 font-cyber-data">{s.step}</span>
                        </div>
                    {idx < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 -mt-3.5 mx-2 rounded ${arr[idx+1].active ? "bg-[#E8FF00]" : "bg-white/5"}`} />
                    )}
                  </div>
                ))}
              </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {/* Location Verification */}
      <AnimatePresence>
        {isCheckingLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-3 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 p-3 bg-[#0F0F0F] border border-[#E8FF00]/30 rounded-xl">
              <RefreshCw className="w-5 h-5 text-[#E8FF00] animate-spin" />
              <span className="text-white/70 text-sm">Verifying your location...</span>
            </div>
          </motion.div>
        )}

        {!locationVerified && locationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-3 max-w-2xl mx-auto"
          >
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-400 font-bold text-sm mb-1">Location Restricted</h4>
                <p className="text-white/60 text-xs leading-relaxed">{locationError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Special Section */}
      {todaySpecialItems.length > 0 && (
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/10 to-orange-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/30 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-full blur-md animate-pulse" />
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <span className="text-white text-lg">🔥</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold font-cyber-header text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    Today's Special
                  </h2>
                  <p className="text-[10px] text-orange-300/70 uppercase tracking-wider">Limited Time Offer</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todaySpecialItems.map((item) => {
                  const itemQuantity = getItemQuantity(item.id);
                  const itemCartId = getItemCartId(item.id);
                  
                  if (itemQuantity > 0) {
                    return (
                      <div
                        key={item.id}
                        className="group w-full relative rounded-2xl p-4 bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 flex flex-col justify-between min-h-[180px] overflow-hidden"
                      >
                        {item.imageUrl && (
                          <div className="absolute inset-0 pointer-events-none">
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-30"
                              sizes="380px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/90 to-transparent" />
                          </div>
                        )}
                        
                        <div className="relative z-10 flex justify-between items-start">
                          <span className="px-2 py-1 rounded bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider">
                            Special
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (itemCartId) {
                                  updateQuantity(itemCartId, itemQuantity - 1);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center hover:border-orange-500/50 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-base font-bold w-5 text-center text-orange-400">
                              {itemQuantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (itemCartId) {
                                  updateQuantity(itemCartId, itemQuantity + 1);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center hover:border-orange-500/50 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="relative z-10 mt-auto">
                          <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="mt-2 font-extrabold text-sm text-orange-400">
                            {formatCurrency(item.price * itemQuantity)}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="group w-full relative rounded-2xl p-4 bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all flex flex-col justify-between min-h-[180px] overflow-hidden text-left"
                    >
                      {item.imageUrl && (
                        <div className="absolute inset-0 pointer-events-none">
                          <Image
                            src={item.imageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-30"
                            sizes="380px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/90 to-transparent" />
                        </div>
                      )}
                      
                      <div className="relative z-10 flex justify-between items-start">
                        <span className="px-2 py-1 rounded bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider">
                          Special
                        </span>
                        <span className="text-orange-400 font-bold text-xs px-2 py-1 rounded-lg bg-black/30 border border-orange-500/20">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      <div className="relative z-10 mt-auto">
                        <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Section */}
      {mounted && (
        <div className="px-4 py-6 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E8FF00]/10 via-purple-500/5 to-[#E8FF00]/10 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-[#E8FF00]/5 to-purple-500/5 border border-[#E8FF00]/30 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E8FF00] rounded-full blur-md animate-pulse" />
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#E8FF00] to-purple-500 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-black" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold font-cyber-header text-transparent bg-clip-text bg-gradient-to-r from-[#E8FF00] to-purple-400">
                    Recommended for You
                  </h2>
                  <p className="text-[10px] text-[#E8FF00]/70 uppercase tracking-wider">AI-Powered Suggestions</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {standardItems.slice(0, 4).map((item) => {
                  const itemQuantity = getItemQuantity(item.id);
                  const itemCartId = getItemCartId(item.id);
                  
                  if (itemQuantity > 0) {
                    return (
                      <div
                        key={item.id}
                        className="group w-full relative rounded-2xl p-4 bg-gradient-to-br from-[#E8FF00]/20 to-purple-500/10 border border-[#E8FF00]/30 flex flex-col justify-between min-h-[180px] overflow-hidden"
                      >
                        <div className="relative z-10 flex justify-between items-start">
                          <span className="px-2 py-1 rounded bg-[#E8FF00] text-black text-[9px] font-bold uppercase tracking-wider">
                            Recommended
                          </span>
                        </div>
                        <div className="relative z-10 mt-auto">
                          <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                          <p className="text-white/60 text-xs mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#E8FF00]">{formatCurrency(item.price)}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (itemCartId) {
                                    updateQuantity(itemCartId, itemQuantity - 1);
                                  }
                                }}
                                className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center hover:border-[#E8FF00]/50 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-base font-bold w-5 text-center text-[#E8FF00]">
                                {itemQuantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (itemCartId) {
                                    updateQuantity(itemCartId, itemQuantity + 1);
                                  }
                                }}
                                className="w-7 h-7 rounded-lg bg-[#E8FF00] text-black flex items-center justify-center hover:bg-[#E8FF00]/90 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="group w-full relative rounded-2xl p-4 bg-gradient-to-br from-[#E8FF00]/10 to-purple-500/5 border border-[#E8FF00]/20 flex flex-col justify-between min-h-[180px] overflow-hidden cursor-pointer hover:border-[#E8FF00]/40 transition-all"
                    >
                      <div className="relative z-10 flex justify-between items-start">
                        <span className="px-2 py-1 rounded bg-[#E8FF00]/20 text-[#E8FF00] text-[9px] font-bold uppercase tracking-wider border border-[#E8FF00]/30">
                          Recommended
                        </span>
                      </div>
                      <div className="relative z-10 mt-auto">
                        <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                        <p className="text-white/60 text-xs mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{formatCurrency(item.price)}</span>
                          <button className="w-8 h-8 rounded-lg bg-[#E8FF00] text-black flex items-center justify-center hover:bg-[#E8FF00]/90 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Categories Bar */}
      <div
        className="sticky z-30 glass-cyber border-x-0 border-t-0 border-b border-white/5 py-3 shadow-sm gpu-accelerate"
        style={{ top: 0 }}
      >
        <div className="flex gap-2 sm:gap-3 px-4 overflow-x-auto no-scrollbar max-w-3xl mx-auto scroll-smooth snap-x snap-mandatory">
          {restaurant.categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`relative shrink-0 snap-start px-4 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-premium touch-target min-h-[40px] ${
                  isActive
                    ? "bg-[#E8FF00] text-black shadow-md shadow-[#E8FF00]/20"
                    : "text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/5"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 sm:py-6 space-y-6 sm:space-y-8 pb-28 sm:pb-32">
          <div className="space-y-6 sm:space-y-8">
            {/* Chef's Specials (Featured Section) */}
            {featuredItems.length > 0 && (
              <div>
                <h2 className="text-xs tracking-[0.2em] font-bold text-[#E8FF00] uppercase mb-4.5 font-cyber-header flex items-center gap-1.5 text-cyber-glow">
                  <Star className="w-3.5 h-3.5 fill-[#E8FF00] text-[#E8FF00]" />
                  Chef&apos;s Selections
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {featuredItems.map((item) => {
                    const itemQuantity = getItemQuantity(item.id);
                    const itemCartId = getItemCartId(item.id);
                    
                    if (itemQuantity > 0) {
                      return (
                        <div
                          key={item.id}
                          className="group w-full relative card-premium rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 border-[#E8FF00]/30 bg-[#E8FF00]/5 flex flex-col justify-between min-h-[220px] sm:min-h-[260px] overflow-hidden"
                        >
                          {item.imageUrl && (
                            <div className="absolute inset-0 pointer-events-none">
                              <Image
                                src={item.imageUrl}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-25 sm:opacity-20"
                                sizes="380px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/85 to-transparent" />
                            </div>
                          )}
                          
                          {/* Top metadata */}
                          <div className="relative z-10 flex justify-between items-start w-full">
                            <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E8FF00] text-black text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                              Signature
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (itemCartId) {
                                    updateQuantity(itemCartId, itemQuantity - 1);
                                  }
                                }}
                                className="w-8 h-8 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-lg font-bold w-6 text-center font-cyber-header text-[#E8FF00]">
                                {itemQuantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (itemCartId) {
                                    updateQuantity(itemCartId, itemQuantity + 1);
                                  }
                                }}
                                className="w-8 h-8 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom content */}
                          <div className="relative z-10 mt-auto">
                            <h3 className="text-lg sm:text-xl font-bold font-cyber-header text-white group-hover:text-[#E8FF00] transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-white/50 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light font-cyber-data">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-2.5 font-extrabold text-sm text-[#E8FF00] font-cyber-data">
                              {formatCurrency(item.price * itemQuantity)}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="group w-full relative card-premium rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 hover:border-[#E8FF00]/20 transition-premium flex flex-col justify-between min-h-[220px] sm:min-h-[260px] overflow-hidden text-left press-scale"
                      >
                        {item.imageUrl && (
                          <div className="absolute inset-0 pointer-events-none">
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-25 sm:opacity-20"
                              sizes="380px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/85 to-transparent" />
                          </div>
                        )}
                        
                        {/* Top metadata */}
                        <div className="relative z-10 flex justify-between items-start w-full">
                          <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E8FF00] text-black text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                            Signature
                          </span>
                          <span className="glass-cyber text-[#E8FF00] font-bold text-xs px-3 py-1.5 rounded-xl border border-white/5 font-cyber-data shadow">
                            {formatCurrency(item.price)}
                          </span>
                        </div>

                        {/* Bottom content */}
                        <div className="relative z-10 mt-auto">
                          <h3 className="text-lg sm:text-xl font-bold font-cyber-header text-white group-hover:text-[#E8FF00] transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-white/50 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light font-cyber-data">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Menu Items */}
            <div>
              <h2 className="text-xs tracking-[0.2em] font-bold text-white/40 uppercase mb-4.5 font-cyber-header">
                A La Carte Selection
              </h2>
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3.5">
                {standardItems.map((item) => {
                  const itemQuantity = getItemQuantity(item.id);
                  const itemCartId = getItemCartId(item.id);
                  
                  if (itemQuantity > 0) {
                    return (
                      <div
                        key={item.id}
                        className="w-full flex gap-3 sm:gap-4 p-3.5 sm:p-4 card-premium rounded-xl sm:rounded-2xl border-[#E8FF00]/30 bg-[#E8FF00]/5 items-center"
                      >
                        {item.imageUrl && (
                          <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border border-white/5">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-[15px] sm:text-base md:text-lg text-white font-cyber-header line-clamp-1">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (itemCartId) {
                                    updateQuantity(itemCartId, itemQuantity - 1);
                                  }
                                }}
                                className="w-8 h-8 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-lg font-bold w-6 text-center font-cyber-header text-[#E8FF00]">
                                {itemQuantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (itemCartId) {
                                    updateQuantity(itemCartId, itemQuantity + 1);
                                  }
                                }}
                                className="w-8 h-8 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-relaxed font-light font-cyber-data">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-2.5 font-extrabold text-sm text-[#E8FF00] font-cyber-data">
                            {formatCurrency(item.price * itemQuantity)}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="w-full flex gap-3 sm:gap-4 p-3.5 sm:p-4 card-premium rounded-xl sm:rounded-2xl hover:border-[#E8FF00]/20 transition-premium items-center text-left press-scale"
                    >
                      {item.imageUrl && (
                        <div className="relative w-[72px] h-[72px] sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border border-white/5">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[15px] sm:text-base md:text-lg text-white font-cyber-header line-clamp-1">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-relaxed font-light font-cyber-data">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-2.5 font-extrabold text-sm text-[#E8FF00] font-cyber-data">
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeItems.length === 0 && (
              <div className="text-center py-16 sm:py-20 text-white/30">
                <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-light font-cyber-data">No creations available in this category yet</p>
              </div>
            )}
          </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {itemCount() > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 400 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#E8FF00] hover:bg-[#E8FF00]/95 text-black shadow-2xl shadow-[#E8FF00]/20 border border-white/5 transition-premium font-cyber-data touch-target press-scale"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom) - 1.5rem)" }}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-[#E8FF00] text-[10px] font-extrabold flex items-center justify-center border border-[#E8FF00]/20 shadow">
                {itemCount()}
              </span>
            </div>
            <span className="font-extrabold text-sm">{formatCurrency(total())}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Voice Order Button */}
      <div className="fixed bottom-6 left-6 z-50" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        <VoiceOrder onOrderRecognized={(text) => {
          console.log("Voice order:", text);
          // TODO: Implement voice-to-cart parsing
        }} />
      </div>

      {/* Item Customization Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemModal
            item={selectedItem}
            slug={restaurant.slug}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Cart Sheet */}
      <AnimatePresence>
        {showCart && (
          <CartSheet
            slug={restaurant.slug}
            tableNumber={tableNumber}
            taxRate={restaurant.taxRate}
            onClose={() => setShowCart(false)}
            onOrderPlaced={(order) => {
              setActiveOrders(prev => [...prev, order]);
              localStorage.setItem(`active_orders_${restaurant.slug}`, JSON.stringify([...activeOrders, order]));
            }}
          />
        )}
      </AnimatePresence>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        restaurantSlug={restaurant.slug}
      />
    </div>
  );
}

function CartSheet({
  slug,
  tableNumber,
  taxRate,
  onClose,
  onOrderPlaced,
}: {
  slug: string;
  tableNumber: number;
  taxRate: number;
  onClose: () => void;
  onOrderPlaced: (order: PlacedOrderTracker) => void;
}) {
  const { items, updateQuantity, removeItem, clearCart, total } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(0);

  const subtotal = total();
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const grandTotal = Math.round((subtotal + tax) * 100) / 100;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/restaurants/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice:
              item.price +
              item.customizations.reduce((s, c) => s + c.price, 0),
            customizations: item.customizations,
            notes: item.notes,
          })),
        }),
      });
      if (!res.ok) throw new Error("Order placement failed");
      const order = await res.json();
      setOrderNumber(order.orderNumber);
      setOrderPlaced(true);
      
      onOrderPlaced({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
      });

      setTimeout(() => {
        clearCart();
        onClose();
      }, 3000);
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0"
    >
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 420 }}
        className="relative w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-t-[1.75rem] bg-[#0F0F0F] border-t border-white/5 shadow-2xl text-white gpu-accelerate overscroll-contain"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {orderPlaced ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="w-20 h-20 rounded-full bg-[#E8FF00] mx-auto flex items-center justify-center mb-6 shadow-xl shadow-[#E8FF00]/10"
            >
              <svg className="w-10 h-10 text-black stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold font-cyber-header">Order Placed Successfully</h2>
            <p className="text-white/50 mt-2 font-light text-sm font-cyber-data">
              Your selections are heading to the kitchen (Order #{orderNumber})
            </p>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold font-cyber-header tracking-tight text-white">
                Gourmet Selection
              </h2>
              <button onClick={onClose} className="p-1 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-start border-b border-dashed border-white/5 pb-4">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white font-cyber-header">{item.name}</div>
                    {item.customizations.length > 0 && (
                      <div className="text-xs text-white/45 mt-1 font-light font-cyber-data">
                        {item.customizations.map((c) => c.optionName).join(", ")}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-[#E8FF00] mt-1 italic font-light font-cyber-data">
                        Note: &ldquo;{item.notes}&rdquo;
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-white/80" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center font-cyber-header">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:border-white/15 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-white/80" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-white font-cyber-data">
                      {formatCurrency(
                        (item.price +
                          item.customizations.reduce((s, c) => s + c.price, 0)) *
                          item.quantity
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="text-red-500 hover:text-red-400 transition-colors mt-2 p-1 hover:bg-red-500/10 rounded-lg"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-[#141414] rounded-2xl border border-white/5 space-y-3 shadow-inner">
              <div className="flex justify-between text-sm text-white/50 font-light font-cyber-data">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/50 font-light font-cyber-data">
                <span>Estimated Tax ({Math.round(taxRate * 1000) / 10}% tax)</span>
                <span className="font-semibold text-white">{formatCurrency(tax)}</span>
              </div>
              <div className="cyber-divider my-2" />
              <div className="flex justify-between font-bold text-base text-white font-cyber-header pt-1">
                <span>Total Due</span>
                <span className="text-[#E8FF00]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full mt-6 py-5 bg-[#E8FF00] hover:bg-[#E8FF00]/95 !text-black font-bold uppercase tracking-wider text-sm shadow-xl shadow-[#E8FF00]/10 rounded-xl font-cyber-data"
            >
              {isSubmitting ? "Sending to kitchen..." : `Confirm Order · ${formatCurrency(grandTotal)}`}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
