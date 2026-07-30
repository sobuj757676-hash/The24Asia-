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


/**
 * Locale-aware currency formatting from minor units (cents).
 * `compact` drops the decimals for dashboard tiles where precision isn't useful.
 */
export function formatMoney(
  amountCents: number,
  currency = "SGD",
  locale = "en",
  compact = false,
): string {
  return new Intl.NumberFormat(locale === "en" ? "en-SG" : locale, {
    style: "currency",
    currency,
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(amountCents / 100);
}

/** Compact number formatting for large counts (1.2K, 3.4M). */
export function formatCount(value: number, locale = "en"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-SG" : locale, {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
