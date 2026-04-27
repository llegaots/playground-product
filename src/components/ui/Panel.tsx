import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-200/10 bg-slate-950/65 shadow-2xl shadow-black/30 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
