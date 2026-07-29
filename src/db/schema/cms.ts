import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { timestamps, localeEnum, contentStatus } from "./_shared";
import { person } from "./identity";

/**
 * Structured content type (PRD CMS-001). One row per content item; localized
 * bodies live in content_translation so we publish once and translate (PRD CMS-011).
 */
export const contentType = pgEnum("content_type", [
  "page",
  "story",
  "news",
  "resource",
  "policy",
  "faq",
  "alert",
  "testimonial",
]);

export const contentItem = pgTable(
  "content_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    type: contentType("type").notNull(),
    slug: text("slug").notNull(),
    status: contentStatus("status").notNull().default("draft"),

    // Governance metadata (PRD CMS-004)
    ownerId: text("owner_id").references(() => person.id),
    reviewDueAt: timestamp("review_due_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    // Safety/legal/health content requires named subject-matter review (CMS-009)
    highRisk: boolean("high_risk").notNull().default(false),

    // Categorisation (mirrors the 7 blog categories currently on 24asia.org)
    category: text("category"),
    tags: jsonb("tags").$type<string[]>().default([]),

    heroMediaId: text("hero_media_id"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("content_type_slug_idx").on(t.type, t.slug),
    index("content_status_idx").on(t.status),
  ],
);

/** Localized body + SEO per locale (PRD CMS-004, 16). */
export const contentTranslation = pgTable(
  "content_translation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    contentId: text("content_id")
      .notNull()
      .references(() => contentItem.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),

    title: text("title").notNull(),
    summary: text("summary"),
    body: text("body"), // markdown/rich text
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),

    // Translation workflow (PRD CMS-011)
    status: contentStatus("status").notNull().default("draft"),
    reviewedById: text("reviewed_by_id").references(() => person.id),
    // true until a human approves a machine translation (PRD 16.3)
    machineTranslated: boolean("machine_translated").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("content_translation_locale_idx").on(t.contentId, t.locale),
  ],
);

/** Content version history for rollback (PRD CMS-006). */
export const contentVersion = pgTable("content_version", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  contentId: text("content_id")
    .notNull()
    .references(() => contentItem.id, { onDelete: "cascade" }),
  locale: localeEnum("locale").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  authorId: text("author_id").references(() => person.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Media library (PRD CMS-005): rights, consent, alt text, retention.
 * Private-by-default object storage keys (PRD 19.1).
 */
export const mediaAsset = pgTable("media_asset", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  caption: text("caption"),
  credit: text("credit"),
  usageRights: text("usage_rights"),
  // consent reference for identifiable subjects (PRD EVT-007)
  consentReference: text("consent_reference"),
  locationSensitive: boolean("location_sensitive").notNull().default(false),
  retentionExpiresAt: timestamp("retention_expires_at", { withTimezone: true }),
  uploadedById: text("uploaded_by_id").references(() => person.id),
  ...timestamps,
});

/** Partners / sponsors (PRD PAR-001..002). */
export const partner = pgTable("partner", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type"), // employer, institution, venue, sponsor, ngo
  logoMediaId: text("logo_media_id").references(() => mediaAsset.id),
  websiteUrl: text("website_url"),
  verified: boolean("verified").notNull().default(false),
  displayPublicly: boolean("display_publicly").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  relationshipOwnerId: text("relationship_owner_id").references(() => person.id),
  ...timestamps,
});

/** Awards (PRD 7.1 Our Impact). */
export const award = pgTable("award", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  awardedBy: text("awarded_by"),
  year: integer("year"),
  description: text("description"),
  mediaId: text("media_id").references(() => mediaAsset.id),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

/**
 * Impact metrics (PRD WEB-007, G-07): every public number has a definition,
 * owner, source and "as of" date. Public pages read approved snapshots only.
 */
export const impactMetric = pgTable("impact_metric", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(), // e.g. "migrants_trained"
  label: text("label").notNull(),
  value: text("value").notNull(), // stored as text to allow "5300+"
  numericValue: integer("numeric_value"),
  definition: text("definition").notNull(),
  source: text("source"),
  ownerId: text("owner_id").references(() => person.id),
  asOf: timestamp("as_of", { withTimezone: true }).notNull().defaultNow(),
  displayOrder: integer("display_order").notNull().default(0),
  publishedPublicly: boolean("published_publicly").notNull().default(false),
  ...timestamps,
});
