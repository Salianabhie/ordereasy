import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "warm";
}

export function Card({
  className,
  variant = "dark",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-6",
        variant === "dark" &&
          "bg-[var(--color-surface-dark)] border border-white/6 text-[var(--color-cream)]",
        variant === "light" &&
          "bg-white border border-[var(--color-border-warm)] text-[var(--color-espresso)] shadow-sm",
        variant === "warm" &&
          "bg-[var(--color-cream-dark)] border border-[var(--color-border-warm)] text-[var(--color-espresso)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-bold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm opacity-50 mt-1", className)} {...props} />
  );
}
