import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";

/**
 * Verified services directory (PRD SUP-009). Public, non-sensitive.
 * Wellbeing/career resources link here; no clinical claims (PRD SUP-002).
 */
export const service = pgTable("service", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  topic: text("topic").notNull(), // wellbeing, career, legal_info, health, financial
  description: text("description"),
  languages: jsonb("languages").$type<string[]>().default([]),
  cost: text("cost"), // "Free", "Subsidised"
  eligibility: text("eligibility"),
  operatingHours: text("operating_hours"),
  contactPhone: text("contact_phone"),
  contactUrl: text("contact_url"),
  isUrgentHelp: boolean("is_urgent_help").notNull().default(false),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  published: boolean("published").notNull().default(false),
  ...timestamps,
});

export const supportSeverity = pgEnum("support_severity", [
  "routine",
  "high",
  "critical",
]);

export const supportStatus = pgEnum("support_status", [
  "received",
  "acknowledged",
  "triage",
  "assigned",
  "contact_attempted",
  "in_progress",
  "referred",
  "completed",
  "unable_to_contact",
  "unmet_need",
  "withdrawn",
]);

/**
 * Private support/contact request (PRD SUP-004..008). RESTRICTED data.
 * Public intake is feature-flagged OFF until trained staffed coverage exists
 * (PRD 30.2 "Staffed support channels"). Access restricted by assignment.
 * Narrative fields never enter analytics/search (PRD 12.3).
 */
export const supportRequest = pgTable(
  "support_request",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // person may be pseudonymous; contact captured minimally
    personId: text("person_id").references(() => person.id, {
      onDelete: "set null",
    }),
    safeContactChannel: text("safe_contact_channel"), // phone/email/in_app
    safeContactTime: text("safe_contact_time"),
    discreetMessageOnly: boolean("discreet_message_only")
      .notNull()
      .default(false),
    topic: text("topic"),
    severity: supportSeverity("severity").notNull().default("routine"),
    status: supportStatus("status").notNull().default("received"),
    assignedToId: text("assigned_to_id").references(() => person.id),
    // consented referral scope (PRD SUP-007)
    referralConsent: jsonb("referral_consent").$type<{
      sharedWith?: string;
      purpose?: string;
      grantedAt?: string;
    }>(),
    outcome: text("outcome"),
    ...timestamps,
  },
  (t) => [index("support_status_idx").on(t.status)],
);
