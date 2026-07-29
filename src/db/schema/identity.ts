import {
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { timestamps, localeEnum } from "./_shared";

/**
 * Roles (PRD 11.1). A role sets maximum capability; contextual ABAC policies
 * (scope in role_assignment) restrict by team/program/case/etc.
 */
export const roleKey = pgEnum("role_key", [
  "guest",
  "member", // learner / community member
  "volunteer_applicant",
  "volunteer",
  "trainer",
  "mentor",
  "coordinator", // team leader / program coordinator
  "support_coordinator",
  "moderator",
  "safeguarding_lead",
  "content_author",
  "translator",
  "publisher",
  "partner_contact",
  "finance",
  "auditor", // governance / DPO (read-only)
  "admin", // platform administrator
  "super_admin",
]);

/**
 * One person per human (PRD IAM-003, principle "one person, one relationship").
 * Links to the auth `user`. Separates required service fields from optional
 * demographic fields (PRD IAM-004).
 */
export const person = pgTable(
  "person",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    displayName: text("display_name"),
    preferredLocale: localeEnum("preferred_locale").notNull().default("en"),

    // Optional demographic / impact fields (confidential). Never used to force
    // locale or infer eligibility (PRD 12.3, 18.1). Minimised by design.
    nationality: text("nationality"), // ISO country code, optional
    languagesSpoken: jsonb("languages_spoken").$type<string[]>().default([]),

    // Adults-first attestation (PRD SAFE-002): no full DOB collected.
    ageAttestedAdult: boolean("age_attested_adult").notNull().default(false),
    // Restricted safeguarding state (PRD SAFE-003).
    ageReview: boolean("age_review").notNull().default(false),

    // Accessibility needs (free text avoided where it drives routing).
    accessibilityNeeds: text("accessibility_needs"),

    ...timestamps,
  },
  (t) => [uniqueIndex("person_user_idx").on(t.userId)],
);

/** Role grants with optional ABAC scope (PRD 11). */
export const roleAssignment = pgTable(
  "role_assignment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    role: roleKey("role").notNull(),
    /**
     * ABAC scope, e.g. { teamId, programId, cohortId, locale }. Empty = global
     * within the role's capability.
     */
    scope: jsonb("scope").$type<Record<string, string>>().default({}),
    grantedBy: text("granted_by").references(() => person.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("role_assignment_person_idx").on(t.personId),
    index("role_assignment_role_idx").on(t.role),
  ],
);

/**
 * Consent ledger (PRD IAM-005): records notice version, purpose, channel,
 * timestamp, and withdrawal for each consent.
 */
export const consentPurpose = pgEnum("consent_purpose", [
  "service",
  "safety",
  "learning",
  "events",
  "volunteering",
  "community",
  "fundraising",
  "marketing",
  "data_sharing_partner",
  "media_release",
]);

export const consentReceipt = pgTable(
  "consent_receipt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    purpose: consentPurpose("purpose").notNull(),
    granted: boolean("granted").notNull(),
    noticeVersion: text("notice_version").notNull(),
    channel: text("channel").notNull().default("web"),
    // withdrawal timestamp if consent later withdrawn
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("consent_person_idx").on(t.personId)],
);

/**
 * Communication preferences, granular by channel + topic (PRD IAM-006, MSG-003).
 */
export const communicationPreference = pgTable(
  "communication_preference",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    topic: consentPurpose("topic").notNull(),
    channelEmail: boolean("channel_email").notNull().default(true),
    channelSms: boolean("channel_sms").notNull().default(false),
    channelPush: boolean("channel_push").notNull().default(false),
    channelInApp: boolean("channel_in_app").notNull().default(true),
    quietHoursStart: text("quiet_hours_start"), // "22:00"
    quietHoursEnd: text("quiet_hours_end"), // "08:00"
    ...timestamps,
  },
  (t) => [
    uniqueIndex("comm_pref_person_topic_idx").on(t.personId, t.topic),
  ],
);
