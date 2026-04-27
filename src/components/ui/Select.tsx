import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, label, ...props }, ref) => (
    <label className="block space-y-2">
      {label ? (
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-amber-200/60">
          {label}
        </span>
      ) : null}
      <select
        ref={ref}
        className={cn(
          "min-h-11 w-full rounded-xl border border-amber-200/10 bg-slate-950/70 px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-400/20",
          error && "border-red-300/60",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-200">{error}</span> : null}
    </label>
  ),
);

Select.displayName = "Select";
