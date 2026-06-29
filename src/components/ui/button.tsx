"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "dark" | "cyber";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "cyber", size = "md", children, ...props }, ref) => {
    const variants = {
      cyber:
        "bg-[#E8FF00] text-black font-bold shadow-lg shadow-[#E8FF00]/15 hover:bg-[#E8FF00]/95 active:scale-[0.98]",
      primary:
        "bg-[#E8FF00] text-black font-bold shadow-lg shadow-[#E8FF00]/15 hover:bg-[#E8FF00]/95 active:scale-[0.98]",
      secondary:
        "bg-[#141414] text-white border border-white/10 hover:border-white/20 hover:bg-[#1A1A1A]",
      dark:
        "bg-[#0F0F0F] text-white border border-white/8 hover:bg-[#141414]",
      ghost:
        "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
      outline:
        "border border-white/10 text-white hover:border-[#E8FF00]/30 hover:bg-[#E8FF00]/5",
    };

    const sizes = {
      sm: "px-3.5 py-2 text-sm rounded-xl min-h-[36px]",
      md: "px-6 py-2.5 text-sm rounded-xl min-h-[44px]",
      lg: "px-8 py-3.5 text-base rounded-xl font-semibold min-h-[52px]",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8FF00]/40 disabled:opacity-50 disabled:pointer-events-none touch-target",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
