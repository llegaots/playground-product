import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: string;
};

export function Badge({ className, color, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-amber-100",
        className,
      )}
      style={{
        ...style,
        ...(color
          ? {
              borderColor: `${color}66`,
              backgroundColor: `${color}22`,
              color,
            }
          : {}),
      }}
      {...props}
    />
  );
}
