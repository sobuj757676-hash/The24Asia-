import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";

/**
 * Feature flags (PRD ADM-001, gates in 30.2). High-risk capabilities ship
 * disabled and are turned on only after their governance gate passes.
 */
export const featureFlag = pgTable("feature_flag", {
  key: text("key").primaryKey(),
  description: text("description").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  // reason the flag is gated (references PRD decision register)
  gateReason: text("gate_reason"),
  ...timestamps,
});

/**
 * Append-only audit event (PRD 19.2). No tokens, secrets, request bodies or
 * unnecessary personal values. Actor + object stored by id.
 */
export const auditEvent = pgTable(
  "audit_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    actorId: text("actor_id").references(() => person.id),
    actorRole: text("actor_role"),
    action: text("action").notNull(), // e.g. "content.published"
    objectType: text("object_type").notNull(),
    objectId: text("object_id"),
    outcome: text("outcome").notNull().default("success"),
    reason: text("reason"),
    // minimal source context (no full URLs/query strings)
    context: jsonb("context").$type<Record<string, unknown>>(),
    correlationId: text("correlation_id"),
  },
  (t) => [
    index("audit_action_idx").on(t.action),
    index("audit_object_idx").on(t.objectType, t.objectId),
    index("audit_occurred_idx").on(t.occurredAt),
  ],
);

export const notificationChannel = pgEnum("notification_channel", [
  "in_app",
  "email",
  "sms",
  "push",
]);

/** Localized notification (PRD MSG-001..005). Discreet previews (MSG-004). */
export const notification = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    channel: notificationChannel("channel").notNull().default("in_app"),
    templateKey: text("template_key").notNull(),
    // discreet subject/body; no sensitive topic leaked on lock screen
    title: text("title").notNull(),
    body: text("body"),
    linkUrl: text("link_url"),
    readAt: timestamp("read_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    failedReason: text("failed_reason"),
    ...timestamps,
  },
  (t) => [index("notification_person_idx").on(t.personId)],
);

/** Web push subscriptions (PWA, PRD 24.2). */
export const pushSubscription = pgTable("push_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  ...timestamps,
});

export const inquiryType = pgEnum("inquiry_type", [
  "contact",
  "partnership",
  "newsletter",
  "content_report",
]);

/**
 * Generic inbound inquiry (PRD PAR-003 partnership, WEB-009 content report,
 * contact form, newsletter signup). Trackable rather than an unowned mailbox.
 */
export const inquiry = pgTable(
  "inquiry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    type: inquiryType("type").notNull(),
    name: text("name"),
    email: text("email"),
    organization: text("organization"),
    subject: text("subject"),
    message: text("message"),
    status: text("status").notNull().default("new"), // new/assigned/resolved
    assignedToId: text("assigned_to_id").references(() => person.id),
    ...timestamps,
  },
  (t) => [index("inquiry_type_idx").on(t.type)],
);

export const donationStatus = pgEnum("donation_status", [
  "initiated",
  "pending",
  "completed",
  "failed",
  "refunded",
]);

/**
 * Donation record (PRD FUND-001..004). Payment is GATED OFF until legal
 * entity/IPC/tax status confirmed (PRD 30.2). No card data ever stored
 * (PRD FUND, 4.3). Completion confirmed by signed webhook only.
 */
export const campaign = pgTable("campaign", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  goalAmountCents: integer("goal_amount_cents"),
  raisedAmountCents: integer("raised_amount_cents").notNull().default(0),
  currency: text("currency").notNull().default("SGD"),
  active: boolean("active").notNull().default(false),
  ...timestamps,
});

export const donation = pgTable("donation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  campaignId: text("campaign_id").references(() => campaign.id, {
    onDelete: "set null",
  }),
  personId: text("person_id").references(() => person.id, {
    onDelete: "set null",
  }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("SGD"),
  status: donationStatus("status").notNull().default("initiated"),
  providerReference: text("provider_reference"), // never card data
  anonymous: boolean("anonymous").notNull().default(false),
  ...timestamps,
});
