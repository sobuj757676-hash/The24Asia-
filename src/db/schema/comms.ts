import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { timestamps, localeEnum } from "./_shared";
import { person } from "./identity";

/** Reusable notification/message template (PRD MSG-001). */
export const messageTemplate = pgTable("message_template", {
  key: text("key").primaryKey(),
  description: text("description"),
  subject: text("subject"),
  body: text("body"),
  locale: localeEnum("locale").notNull().default("en"),
  ...timestamps,
});

export const campaignStatus = pgEnum("campaign_status", [
  "draft",
  "in_review",
  "scheduled",
  "sending",
  "sent",
  "cancelled",
]);

/**
 * Newsletter / broadcast campaign (PRD MSG-007/008). Audience is resolved from
 * communication preferences; withdrawn/invalid channels are excluded.
 */
export const newsletterCampaign = pgTable("newsletter_campaign", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  topic: text("topic").notNull().default("marketing"),
  channel: text("channel").notNull().default("email"), // email | in_app | push
  status: campaignStatus("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  recipientCount: integer("recipient_count").notNull().default(0),
  createdById: text("created_by_id").references(() => person.id),
  ...timestamps,
});

/** Social content calendar (PRD MSG-009). */
export const socialPost = pgTable("social_post", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  platform: text("platform").notNull(), // facebook | instagram | tiktok ...
  copy: text("copy").notNull(),
  status: text("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  postUrl: text("post_url"),
  ownerId: text("owner_id").references(() => person.id),
  ...timestamps,
});

/** Newsletter subscriber (public signup, PRD MSG-008). */
export const subscriber = pgTable(
  "subscriber",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    locale: localeEnum("locale").notNull().default("en"),
    confirmed: boolean("confirmed").notNull().default(false),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("subscriber_email_idx").on(t.email)],
);
