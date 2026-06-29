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
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UpsellSuggestion } from "@/lib/upsell-engine";

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0F0F0F] text-white border border-white/5 shadow-2xl"
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
                    className="flex-1 !py-6 bg-[#E8FF00] hover:bg-[#E8FF00]/95 !text-black font-bold uppercase tracking-wider text-sm shadow-xl shadow-[#E8FF00]/10 rounded-xl font-cyber-data"
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
  const { total, itemCount, setContext } = useCartStore();
  const [showCart, setShowCart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeOrder, setActiveOrder] = useState<PlacedOrderTracker | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`active_order_${restaurant.slug}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  useEffect(() => {
    setContext(restaurant.slug, tableNumber);
  }, [restaurant.slug, tableNumber, setContext]);

  // Poll order status if there is an active order
  useEffect(() => {
    if (!activeOrder) return;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/restaurants/${restaurant.slug}/orders`);
        if (!res.ok) return;
        const orders = (await res.json()) as { id: string; status: string }[];
        const matching = orders.find((o) => o.id === activeOrder.id);
        
        if (matching) {
          if (matching.status !== activeOrder.status) {
            const updated = { ...activeOrder, status: matching.status };
            setActiveOrder(updated);
            localStorage.setItem(`active_order_${restaurant.slug}`, JSON.stringify(updated));
          }
          
          if (["completed", "cancelled"].includes(matching.status)) {
            // Remove from active tracking after some time
            setTimeout(() => {
              setActiveOrder(null);
              localStorage.removeItem(`active_order_${restaurant.slug}`);
            }, 6000);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [activeOrder, restaurant.slug]);

  const activeItems =
    restaurant.categories.find((c) => c.slug === activeCategory)?.menuItems ??
    [];

  // Separate popular (featured) and standard items
  const featuredItems = activeItems.filter((i) => i.isPopular);
  const standardItems = activeItems.filter((i) => !i.isPopular);

  return (
    <div className="min-h-screen bg-[#080808] text-white pb-32 font-sans">
      {/* Premium Parallax Cover Header */}
      <div className="relative h-64 bg-[#0F0F0F] overflow-hidden border-b border-white/5 shadow-md">
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
        
        {/* Floating Table Badge */}
        <div className="absolute top-5 right-5 z-20 glass-cyber rounded-xl px-4.5 py-2 border border-[#E8FF00]/20 text-[10px] font-bold text-[#E8FF00] tracking-widest uppercase shadow-lg shadow-black/50 font-cyber-header">
          Table {tableNumber}
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 z-10 flex flex-col justify-end">
          <div className="flex items-center gap-4">
            {restaurant.logoUrl && (
              <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-[#E8FF00] shrink-0 shadow-lg shadow-[#E8FF00]/5 bg-[#080808]">
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
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
                <h1 className="text-3xl font-extrabold text-white tracking-tight font-cyber-header text-cyber-glow">
                  {restaurant.name}
                </h1>
                <ChevronDown className={`w-5 h-5 text-[#E8FF00] transition-transform duration-300 ${showInfo ? "rotate-180" : ""}`} />
              </div>
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

      {/* Active Placed Order Tracker */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 pt-4 max-w-2xl mx-auto"
          >
            <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/80 text-white">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-[#E8FF00]" />
                  <span className="font-bold font-cyber-header text-sm">Active Order #{activeOrder.orderNumber}</span>
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
                  {activeOrder.status === "pending" && "Pending Confirmation"}
                  {activeOrder.status === "preparing" && "Cooking in Kitchen"}
                  {activeOrder.status === "ready" && "Ready to Serve!"}
                  {activeOrder.status === "completed" && "Completed!"}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Categories Bar */}
      <div className="sticky top-0 z-30 glass-cyber border-x-0 border-t-0 border-b border-white/5 py-3.5 shadow-md">
        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar max-w-3xl mx-auto">
          {restaurant.categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`relative shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive ? "text-black" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-[#E8FF00] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Chef's Specials (Featured Section) */}
            {featuredItems.length > 0 && (
              <div>
                <h2 className="text-xs tracking-[0.2em] font-bold text-[#E8FF00] uppercase mb-4.5 font-cyber-header flex items-center gap-1.5 text-cyber-glow">
                  <Star className="w-3.5 h-3.5 fill-[#E8FF00] text-[#E8FF00]" />
                  Chef&apos;s Selections
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredItems.map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedItem(item)}
                      className="group w-full relative bg-[#0F0F0F] rounded-3xl border border-white/5 p-4.5 hover:border-[#E8FF00]/20 transition-all duration-300 shadow-xl hover:shadow-black/60 flex flex-col justify-between h-[280px] overflow-hidden text-left"
                    >
                      {item.imageUrl && (
                        <div className="absolute inset-0 pointer-events-none">
                          <Image
                            src={item.imageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-20 filter blur-[0.5px]"
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
                        <h3 className="text-xl font-bold font-cyber-header text-white group-hover:text-[#E8FF00] transition-colors">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-white/50 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light font-cyber-data">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Menu Items */}
            <div>
              <h2 className="text-xs tracking-[0.2em] font-bold text-white/40 uppercase mb-4.5 font-cyber-header">
                A La Carte Selection
              </h2>
              <div className="grid grid-cols-1 gap-3.5">
                {standardItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedItem(item)}
                    className="w-full flex gap-4 p-4 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-[#E8FF00]/20 transition-all duration-300 shadow-md hover:shadow-black/40 items-center text-left"
                  >
                    {item.imageUrl && (
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border border-white/5 shadow-inner">
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
                      <h3 className="font-bold text-base md:text-lg text-white font-cyber-header">
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
                  </motion.button>
                ))}
              </div>
            </div>

            {activeItems.length === 0 && (
              <div className="text-center py-20 text-white/30">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-25 animate-pulse" />
                <p className="text-sm font-light font-cyber-data">No creations available in this category yet</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Premium Cart Button */}
      <AnimatePresence>
        {itemCount() > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 p-4 z-40"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full max-w-lg mx-auto flex items-center justify-between px-6 py-4 rounded-xl bg-[#E8FF00] hover:bg-[#E8FF00]/95 text-black shadow-2xl shadow-[#E8FF00]/15 border border-white/5 active:scale-98 transition-all font-cyber-data"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-2.5 -right-2.5 w-5.5 h-5.5 rounded-full bg-black text-[#E8FF00] text-[10px] font-extrabold flex items-center justify-center border border-[#E8FF00]/20 shadow">
                    {itemCount()}
                  </span>
                </div>
                <span className="font-extrabold tracking-wider text-xs uppercase pl-2">Review Table Order</span>
              </div>
              <span className="font-extrabold text-sm">{formatCurrency(total())}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              setActiveOrder(order);
              localStorage.setItem(`active_order_${restaurant.slug}`, JSON.stringify(order));
            }}
          />
        )}
      </AnimatePresence>
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
      className="fixed inset-0 z-50 flex items-end justify-center p-0"
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#0F0F0F] border-t border-white/5 shadow-2xl text-white"
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
                      className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors mt-2 font-cyber-data"
                    >
                      Delete
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
