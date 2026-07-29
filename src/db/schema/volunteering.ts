import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  numeric,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";
import { event } from "./events";

export const riskLevel = pgEnum("risk_level", ["low", "medium", "high"]);

/** Structured volunteer opportunity (PRD VOL-001). */
export const opportunity = pgTable(
  "opportunity",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    purpose: text("purpose"),
    duties: text("duties"),
    skillsRequired: jsonb("skills_required").$type<string[]>().default([]),
    commitment: text("commitment"), // "4 hrs/week, 3 months"
    locationName: text("location_name"),
    riskLevel: riskLevel("risk_level").notNull().default("low"),
    requiresTraining: boolean("requires_training").notNull().default(false),
    capacity: integer("capacity"),
    supervisorId: text("supervisor_id").references(() => person.id),
    published: boolean("published").notNull().default(false),
    ...timestamps,
  },
);

export const volunteerApplicationStatus = pgEnum(
  "volunteer_application_status",
  [
    "draft",
    "submitted",
    "under_review",
    "more_information",
    "interview",
    "screening_pending",
    "approved",
    "waitlisted",
    "declined",
    "withdrawn",
    "suspended",
    "archived",
  ],
);

/** Volunteer application lifecycle (PRD VOL-003). */
export const volunteerApplication = pgTable(
  "volunteer_application",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    opportunityId: text("opportunity_id").references(() => opportunity.id, {
      onDelete: "set null",
    }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    status: volunteerApplicationStatus("status")
      .notNull()
      .default("submitted"),
    motivation: text("motivation"),
    decisionReason: text("decision_reason"),
    reviewedById: text("reviewed_by_id").references(() => person.id),
    ...timestamps,
  },
  (t) => [index("vol_application_status_idx").on(t.status)],
);

export const volunteerStanding = pgEnum("volunteer_standing", [
  "probation",
  "active",
  "paused",
  "suspended",
  "exited",
  "alumni",
]);

/** Volunteer profile: skills, availability, hours, recognition (PRD VOL-011). */
export const volunteerProfile = pgTable(
  "volunteer_profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    standing: volunteerStanding("standing").notNull().default("probation"),
    skills: jsonb("skills").$type<string[]>().default([]),
    languages: jsonb("languages").$type<string[]>().default([]),
    availability: jsonb("availability").$type<string[]>().default([]),
    team: text("team"),
    totalHours: numeric("total_hours").notNull().default("0"),
    // handbook / code of conduct acknowledged (PRD VOL-005)
    handbookAcknowledgedAt: timestamp("handbook_acknowledged_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  (t) => [uniqueIndex("volunteer_profile_person_idx").on(t.personId)],
);

/** Shift assignment for an event/opportunity (PRD VOL-009). */
export const shiftAssignment = pgTable(
  "shift_assignment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => event.id, {
      onDelete: "cascade",
    }),
    opportunityId: text("opportunity_id").references(() => opportunity.id, {
      onDelete: "set null",
    }),
    role: text("role"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    status: text("status").notNull().default("offered"), // offered/accepted/confirmed/checked_in/completed/no_show/cancelled
    ...timestamps,
  },
  (t) => [index("shift_person_idx").on(t.personId)],
);

/** Volunteer hours, approved by supervisor (PRD VOL-010). */
export const timeEntry = pgTable(
  "time_entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    shiftId: text("shift_id").references(() => shiftAssignment.id, {
      onDelete: "set null",
    }),
    hours: numeric("hours").notNull(),
    activityDate: timestamp("activity_date", { withTimezone: true }).notNull(),
    note: text("note"),
    approved: boolean("approved").notNull().default(false),
    approvedById: text("approved_by_id").references(() => person.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("time_entry_person_idx").on(t.personId)],
);

/** Recognition: milestones/badges (PRD VOL-014). */
export const recognition = pgTable("recognition", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  personId: text("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // milestone, badge, appreciation
  label: text("label").notNull(),
  awardedAt: timestamp("awarded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ...timestamps,
});
