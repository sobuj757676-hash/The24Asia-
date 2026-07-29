import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date in Singapore time, locale-aware. */
export function formatDate(
  date: Date | string | null | undefined,
  locale = "en",
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "en" ? "en-SG" : locale, {
    timeZone: "Asia/Singapore",
    ...opts,
  }).format(d);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
