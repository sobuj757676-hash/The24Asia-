import { env } from "@/env";

/**
 * Resolves a stored media key to a public URL.
 *
 * Media is kept in object storage and referenced by `storageKey`. Until
 * `S3_PUBLIC_BASE_URL` is configured there is nothing to serve, so this returns
 * null and every caller falls back to a designed placeholder rather than
 * rendering a broken image frame.
 */
export function mediaUrl(storageKey?: string | null): string | null {
  if (!storageKey) return null;
  const base = env.S3_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${storageKey.replace(/^\//, "")}`;
}

/**
 * Deterministic accent per category so a course or event always gets the same
 * colour treatment everywhere it appears. This is how the cards get visual
 * identity without depending on photography the organisation may not have.
 *
 * Every option stays inside the existing 24Asia palette — the brand greens plus
 * the teal neighbour and the single orange accent. An earlier version reached
 * for magenta, violet and indigo, which looked lively in isolation but simply
 * was not this brand.
 */
const ACCENTS = [
  "from-brand-500 to-brand-700",
  "from-brand-600 to-teal-700",
  "from-teal-500 to-brand-700",
  "from-brand-700 to-brand-900",
  "from-teal-600 to-brand-800",
] as const;
/*
 * Note: the orange accent is deliberately NOT in this list. In this design
 * language orange means "urgent" — it is the urgent-help strip and the
 * emergency callouts. A course cover rendered in it (WPLN drew the orange slot)
 * read as a warning rather than a subject.
 */

export function accentFor(seed: string | null | undefined): string {
  if (!seed) return ACCENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return ACCENTS[hash % ACCENTS.length];
}
