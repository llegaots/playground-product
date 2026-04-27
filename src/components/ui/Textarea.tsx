import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, ...props }, ref) => {
    const textarea = (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-xl border border-amber-300/15 bg-slate-950/70 px-3 py-2 text-sm text-amber-50 outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/10",
          error && "border-red-400/60",
          className,
        )}
        {...props}
      />
    );

    if (!label) return textarea;

    return (
      <label className="block space-y-2">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-amber-200/60">
          {label}
        </span>
        {textarea}
        {error ? <span className="block text-xs text-red-300">{error}</span> : null}
      </label>
    );
  },
);

Textarea.displayName = "Textarea";
