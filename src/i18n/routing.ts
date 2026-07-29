import { defineRouting } from "next-intl/routing";

/**
 * Launch locales (PRD 16.1): English (en-SG source), Bengali, Tamil are P0.
 * The others are pre-wired as P1 candidates but not surfaced until reviewer
 * capacity exists. Locale is chosen by the user, never inferred from IP,
 * nationality, employer, or SIM (PRD 16.1).
 */
export const routing = defineRouting({
  locales: ["en", "bn", "ta"],
  defaultLocale: "en",
  localePrefix: "as-needed", // default locale has no prefix, keeps URLs clean
  localeDetection: false, // do not force locale (PRD 16.1)
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  bn: "বাংলা",
  ta: "தமிழ்",
};
