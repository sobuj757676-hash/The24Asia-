import {
  pgTable,
  text,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";
import { partner } from "./cms";

/** Career goals + action plan (PRD CAR-002). */
export const careerGoal = pgTable(
  "career_goal",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    detail: text("detail"),
    status: text("status").notNull().default("active"), // active/achieved/paused
    targetDate: timestamp("target_date", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("goal_person_idx").on(t.personId)],
);

/** Mentor profile (PRD CAR-003). */
export const mentorProfile = pgTable("mentor_profile", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  expertise: jsonb("expertise").$type<string[]>().default([]),
  languages: jsonb("languages").$type<string[]>().default([]),
  bio: text("bio"),
  capacity: text("capacity"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const matchStatus = pgEnum("match_status", [
  "requested",
  "under_review",
  "matched",
  "active",
  "closed",
  "declined",
]);

/** Mentorship match between mentee and mentor (PRD CAR-003/004). */
export const mentorMatch = pgTable(
  "mentor_match",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    menteeId: text("mentee_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    mentorId: text("mentor_id").references(() => person.id, {
      onDelete: "set null",
    }),
    status: matchStatus("status").notNull().default("requested"),
    topic: text("topic"),
    // explicit consent before profile/document sharing (PRD CAR-007)
    consentToShare: boolean("consent_to_share").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("match_mentee_idx").on(t.menteeId)],
);

export const mentoringSession = pgTable("mentoring_session", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchId: text("match_id")
    .notNull()
    .references(() => mentorMatch.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  notes: text("notes"), // visible to matched mentor + mentee only
  completed: boolean("completed").notNull().default(false),
  ...timestamps,
});

/** Verified employer/partner opportunity listing (PRD CAR-005/006). */
export const opportunityListing = pgTable(
  "opportunity_listing",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    partnerId: text("partner_id").references(() => partner.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    roleType: text("role_type"), // job, internship, training
    compensation: text("compensation"),
    eligibility: text("eligibility"),
    // zero-fee organizational policy label (PRD CAR-006)
    feeDeclaration: text("fee_declaration").default("No fees charged to workers."),
    accountableContact: text("accountable_contact"),
    verified: boolean("verified").notNull().default(false),
    published: boolean("published").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("listing_published_idx").on(t.published)],
);

export const listingApplication = pgTable(
  "listing_application",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    listingId: text("listing_id")
      .notNull()
      .references(() => opportunityListing.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    milestone: text("milestone").notNull().default("interested"),
    // explicit consent to share profile with employer (PRD CAR-007)
    consentToShare: boolean("consent_to_share").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("listing_app_person_idx").on(t.personId)],
);
