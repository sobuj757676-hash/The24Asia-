import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";
import { partner } from "./cms";

/** Governance meeting with minutes/decisions (PRD OPS-007). */
export const meeting = pgTable("meeting", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  heldAt: timestamp("held_at", { withTimezone: true }),
  attendees: jsonb("attendees").$type<string[]>().default([]),
  minutes: text("minutes"),
  decisions: text("decisions"),
  ...timestamps,
});

export const riskLevelEnum = pgEnum("risk_rating", ["low", "medium", "high", "critical"]);

/** Risk register (PRD OPS-008). */
export const risk = pgTable("risk", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category").notNull(),
  description: text("description").notNull(),
  likelihood: riskLevelEnum("likelihood").notNull().default("low"),
  impact: riskLevelEnum("impact").notNull().default("low"),
  ownerId: text("owner_id").references(() => person.id),
  controls: text("controls"),
  status: text("status").notNull().default("open"),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  ...timestamps,
});

export const incidentSeverity = pgEnum("incident_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

/**
 * Incident workflow (PRD OPS-009). Covers operational/safety/data/security/
 * conduct/reputational. Restricted evidence; access limited by assignment.
 */
export const incident = pgTable(
  "incident",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    type: text("type").notNull(),
    severity: incidentSeverity("severity").notNull().default("low"),
    summary: text("summary").notNull(),
    status: text("status").notNull().default("reported"),
    ownerId: text("owner_id").references(() => person.id),
    reportedById: text("reported_by_id").references(() => person.id),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("incident_status_idx").on(t.status)],
);

/** Policies + acknowledgements (PRD OPS-005, VOL-005). */
export const policy = pgTable("policy", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  body: text("body"),
  version: text("version").notNull().default("1.0"),
  effectiveAt: timestamp("effective_at", { withTimezone: true }),
  published: boolean("published").notNull().default(false),
  ...timestamps,
});

export const policyAcknowledgement = pgTable(
  "policy_acknowledgement",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    policyId: text("policy_id")
      .notNull()
      .references(() => policy.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("policy_ack_idx").on(t.policyId, t.personId, t.version)],
);

/** Partner agreement (PRD PAR-005) + partner contact link. */
export const partnerAgreement = pgTable("partner_agreement", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  partnerId: text("partner_id")
    .notNull()
    .references(() => partner.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type"),
  effectiveAt: timestamp("effective_at", { withTimezone: true }),
  expiryAt: timestamp("expiry_at", { withTimezone: true }),
  dataSharingTerms: text("data_sharing_terms"),
  documentKey: text("document_key"),
  ...timestamps,
});

export const partnerContact = pgTable(
  "partner_contact",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partner.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    title: text("title"),
    isPrimary: boolean("is_primary").notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("partner_contact_idx").on(t.partnerId, t.personId)],
);
