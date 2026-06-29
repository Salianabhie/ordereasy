"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, Clock, ChefHat } from "lucide-react";
import type { Restaurant } from "@/lib/data/types";

interface WelcomeScreenProps {
  restaurant: Restaurant;
  tableNumber: string;
}

export function WelcomeScreen({ restaurant, tableNumber }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-screen-safe bg-cyber-mesh text-white flex items-center justify-center px-safe py-safe overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {restaurant.coverUrl && (
          <Image
            src={restaurant.coverUrl}
            alt={restaurant.name}
            fill
            priority
            className="object-cover scale-105 opacity-20 md:opacity-25"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#080808]/95 to-[#080808]" />
      </div>

      {/* Ambient glow — static, no blur filter on mobile */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden hidden sm:block">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#E8FF00]/5 blur-2xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#9B7EDE]/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-md card-premium card-premium-accent rounded-[1.75rem] sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center gpu-accelerate"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 border-[#E8FF00] bg-[#080808] mx-auto -mt-14 sm:-mt-16 overflow-hidden flex items-center justify-center shadow-xl shadow-[#E8FF00]/10"
        >
          {restaurant.logoUrl ? (
            <Image
              src={restaurant.logoUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="88px"
            />
          ) : (
            <ChefHat className="w-9 h-9 sm:w-10 sm:h-10 text-[#E8FF00]" />
          )}
        </motion.div>

        {/* Header */}
        <div className="mt-5 sm:mt-6 mb-5 sm:mb-6">
          <span className="text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-[#E8FF00] font-bold uppercase mb-2 block font-cyber-header">
            Welcome To
          </span>
          <h1 className="text-fluid-title font-extrabold font-cyber-header text-white tracking-tight mb-3">
            {restaurant.name}
          </h1>
          <div className="cyber-divider-accent my-4" />
          {restaurant.description && (
            <p className="text-sm text-white/60 font-light leading-relaxed px-1 sm:px-2 font-cyber-data">
              {restaurant.description}
            </p>
          )}
        </div>

        {/* Table badge */}
        <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 mb-6 sm:mb-8 text-sm font-cyber-data">
          <span className="w-2 h-2 rounded-full bg-[#E8FF00] shrink-0" />
          <span className="font-medium text-white/80">
            Dine-in at{" "}
            <span className="text-[#E8FF00] font-bold">Table {tableNumber}</span>
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/${restaurant.slug}/order?table=${tableNumber}`}
          className="group touch-target w-full py-4 sm:py-[1.125rem] rounded-xl bg-[#E8FF00] active:bg-[#E8FF00]/90 text-black font-bold tracking-wider text-sm uppercase transition-premium shadow-lg shadow-[#E8FF00]/15 flex items-center justify-center gap-2 font-cyber-data press-scale"
        >
          Enter Digital Menu
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Metadata */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/5 space-y-3 text-xs text-white/45 font-cyber-data">
          {restaurant.address && (
            <div className="flex items-center gap-3 justify-center">
              <MapPin className="w-3.5 h-3.5 text-[#E8FF00] shrink-0" />
              <span className="font-light text-left line-clamp-2 max-w-[280px]">
                {restaurant.address}
              </span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-3 justify-center">
              <Phone className="w-3.5 h-3.5 text-[#E8FF00] shrink-0" />
              <span className="font-light">{restaurant.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-3 justify-center">
            <Clock className="w-3.5 h-3.5 text-[#E8FF00] shrink-0" />
            <span className="font-light">Open today · 11:30 AM - 10:00 PM</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
