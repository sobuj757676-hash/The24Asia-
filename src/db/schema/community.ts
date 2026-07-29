import {
  pgTable,
  text,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";

/** Moderated cohort/group (PRD COM-001). Invite/approval only at launch. */
export const group = pgTable("group", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  purpose: text("purpose"),
  rules: text("rules"),
  moderated: boolean("moderated").notNull().default(true),
  // pre-moderate new/high-risk posts (PRD COM-005)
  preModerate: boolean("pre_moderate").notNull().default(true),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const groupRole = pgEnum("group_role", ["member", "moderator"]);

export const groupMembership = pgTable(
  "group_membership",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    role: groupRole("role").notNull().default("member"),
    // pseudonymous display name allowed (PRD COM-002)
    displayAlias: text("display_alias"),
    ...timestamps,
  },
  (t) => [uniqueIndex("group_member_idx").on(t.groupId, t.personId)],
);

export const postStatus = pgEnum("post_status", [
  "pending",
  "published",
  "quarantined",
  "removed",
]);

export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: postStatus("status").notNull().default("pending"),
    ...timestamps,
  },
  (t) => [index("post_group_idx").on(t.groupId)],
);

export const reply = pgTable(
  "reply",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: postStatus("status").notNull().default("published"),
    ...timestamps,
  },
  (t) => [index("reply_post_idx").on(t.postId)],
);

export const reportStatus = pgEnum("report_status", [
  "queued",
  "reviewing",
  "actioned",
  "dismissed",
]);

/** User report on content (PRD COM-003/006). */
export const contentReport = pgTable(
  "content_report",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    reporterId: text("reporter_id").references(() => person.id, {
      onDelete: "set null",
    }),
    targetType: text("target_type").notNull(), // post | reply
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    status: reportStatus("status").notNull().default("queued"),
    // moderation outcome
    action: text("action"), // warning | removal | restriction | none
    reviewedById: text("reviewed_by_id").references(() => person.id),
    ...timestamps,
  },
  (t) => [index("report_status_idx").on(t.status)],
);

export const block = pgTable(
  "block",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    blockedPersonId: text("blocked_person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [uniqueIndex("block_idx").on(t.personId, t.blockedPersonId)],
);
