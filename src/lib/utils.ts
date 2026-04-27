import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string | null) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatRelativeDate(date?: string | null) {
  if (!date) return "Never";
  const parsed = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffDays = Math.round((parsed.getTime() - Date.now()) / 86_400_000);

  if (Math.abs(diffDays) < 1) return "Today";
  if (Math.abs(diffDays) < 31) return formatter.format(diffDays, "day");
  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return formatter.format(diffMonths, "month");
  return formatter.format(Math.round(diffMonths / 12), "year");
}

export function daysSince(date?: string | null) {
  if (!date) return Number.POSITIVE_INFINITY;
  const then = new Date(`${date}T00:00:00`).getTime();
  const now = new Date().getTime();
  return Math.floor((now - then) / 86_400_000);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
