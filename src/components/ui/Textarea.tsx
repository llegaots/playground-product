import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-xl border border-amber-300/15 bg-slate-950/70 px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/10",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
