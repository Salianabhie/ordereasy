"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "dark";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary:
        "gradient-warm text-white shadow-lg shadow-[#FF6B4A]/30 hover:shadow-[#FF6B4A]/40 hover:brightness-105",
      secondary:
        "bg-[var(--color-espresso)] text-[var(--color-cream)] hover:bg-[#3D342F]",
      dark:
        "bg-[var(--color-surface-dark)] text-[var(--color-cream)] border border-white/8 hover:bg-[#2F2820]",
      ghost:
        "bg-transparent text-[var(--color-espresso-muted)] hover:text-[var(--color-espresso)] hover:bg-[var(--color-espresso)]/5",
      outline:
        "border-2 border-[var(--color-border-warm)] text-[var(--color-espresso)] hover:border-[var(--color-coral)] hover:bg-[var(--color-coral)]/5",
    };

    const sizes = {
      sm: "px-3.5 py-2 text-sm rounded-full",
      md: "px-6 py-2.5 text-sm rounded-full",
      lg: "px-8 py-3.5 text-base rounded-full font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]/40 disabled:opacity-50 disabled:pointer-events-none",
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
