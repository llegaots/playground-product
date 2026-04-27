import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-amber-400/70 bg-amber-400 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.24)] hover:bg-amber-300",
  secondary:
    "border-amber-400/30 bg-slate-900/80 text-amber-100 hover:border-amber-300/60 hover:bg-slate-800",
  ghost: "border-transparent bg-transparent text-slate-300 hover:bg-white/5 hover:text-amber-100",
  danger: "border-red-400/40 bg-red-950/60 text-red-100 hover:bg-red-900/70",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({ asChild = false, className, size = "md", variant = "primary", ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
