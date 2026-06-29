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
    <div className="relative min-h-screen bg-[#080808] text-white flex items-center justify-center p-4 md:p-6 overflow-hidden font-sans">
      {/* Background with parallax ambient zoom */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {restaurant.coverUrl && (
          <Image
            src={restaurant.coverUrl}
            alt={restaurant.name}
            fill
            priority
            className="object-cover scale-105 filter blur-[6px] opacity-25 transition-transform duration-[20s]"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#080808]/90 to-[#080808]" />
      </div>

      {/* Decorative cyber ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#E8FF00]/5 filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#9B7EDE]/5 filter blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-md bg-[#0F0F0F]/85 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/5 shadow-2xl shadow-black/80 text-center"
      >
        {/* Monogram/Logo Wrapper */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative w-22 h-22 rounded-2xl border-2 border-[#E8FF00] bg-[#080808] mx-auto -mt-18 md:-mt-20 overflow-hidden flex items-center justify-center shadow-xl shadow-[#E8FF00]/10"
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
            <ChefHat className="w-10 h-10 text-[#E8FF00]" />
          )}
        </motion.div>

        {/* Header content */}
        <div className="mt-6 mb-6">
          <span className="text-[10px] tracking-[0.3em] text-[#E8FF00] font-bold uppercase mb-2 block font-cyber-header">
            Welcome To
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-cyber-header text-white tracking-tight mb-3">
            {restaurant.name}
          </h1>
          <div className="cyber-divider-accent my-4" />
          {restaurant.description && (
            <p className="text-sm text-white/60 font-light leading-relaxed px-2 font-cyber-data">
              {restaurant.description}
            </p>
          )}
        </div>

        {/* Table indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 mb-8 text-sm shadow-inner font-cyber-data"
        >
          <span className="w-2 h-2 rounded-full bg-[#E8FF00] animate-ping" />
          <span className="font-medium text-white/80">
            Dine-in at <span className="text-[#E8FF00] font-bold">Table {tableNumber}</span>
          </span>
        </motion.div>

        {/* Order button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href={`/${restaurant.slug}/order?table=${tableNumber}`}
            className="group w-full py-4 rounded-xl bg-[#E8FF00] hover:bg-[#E8FF00]/95 text-black font-bold tracking-wider text-sm uppercase transition-all duration-300 shadow-lg shadow-[#E8FF00]/10 hover:shadow-[#E8FF00]/20 flex items-center justify-center gap-2 font-cyber-data"
          >
            Enter Digital Menu
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Restaurant metadata details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-white/5 space-y-3.5 text-xs text-white/45 font-cyber-data"
        >
          {restaurant.address && (
            <div className="flex items-center gap-3 justify-center">
              <MapPin className="w-3.5 h-3.5 text-[#E8FF00] shrink-0" />
              <span className="font-light text-left truncate max-w-[280px]">
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
        </motion.div>
      </motion.div>
    </div>
  );
}
