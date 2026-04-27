import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputClassName =
  "w-full rounded-xl border border-amber-200/10 bg-slate-950/70 px-3 py-2.5 text-sm text-amber-50 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-400/10";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, label, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className={cn("block space-y-2", label ? "" : "space-y-0")}>
        {label ? (
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-amber-200/60">
            {label}
          </span>
        ) : null}
        <input id={inputId} ref={ref} className={cn(inputClassName, className)} {...props} />
        {error ? <span className="block text-xs text-red-300">{error}</span> : null}
      </label>
    );
  },
);

Input.displayName = "Input";
