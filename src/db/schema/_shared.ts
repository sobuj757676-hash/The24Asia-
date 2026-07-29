import { pgEnum, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Data classification per PRD 12.2. Every table that holds member data
 * declares its highest classification via a `classification` column or in
 * comments so retention/export policy can be enforced.
 */
export const dataClassification = pgEnum("data_classification", [
  "public",
  "internal",
  "confidential",
  "restricted",
]);

/** Locale codes enabled at launch (PRD 16.1: en-SG, bn, ta are P0). */
export const localeEnum = pgEnum("locale", [
  "en", // en-SG (source)
  "bn", // Bengali
  "ta", // Tamil
  "id", // Bahasa Indonesia/Malay (P1)
  "tl", // Tagalog/Filipino (P1)
  "my", // Burmese (P1)
  "zh", // Simplified Chinese (P1)
]);

/** Generic content lifecycle (PRD 10.6). */
export const contentStatus = pgEnum("content_status", [
  "draft",
  "in_review",
  "translation",
  "language_review",
  "approved",
  "scheduled",
  "published",
  "needs_review",
  "archived",
  "superseded",
]);

/** Timestamp helpers with timezone (PRD 12.3: dates store timezone). */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Soft-delete marker; historical records are preserved, not rewritten. */
export const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

/** cuid-like public identifier, non-sequential (PRD 12.3). */
export function publicId() {
  return text("public_id")
    .notNull()
    .default(sql`gen_random_uuid()`);
}
