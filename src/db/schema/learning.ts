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
} from "drizzle-orm/pg-core";
import { timestamps, localeEnum } from "./_shared";
import { person } from "./identity";

export const deliveryMode = pgEnum("delivery_mode", [
  "in_person",
  "online",
  "hybrid",
]);

/**
 * Reusable course template (PRD LMS-001). Maps the current 24asia catalog:
 * Word/Excel/PowerPoint/AutoCAD/WSH/Graphic Design/Video Editing/Public
 * Speaking/Computer Fundamentals/WPLN etc.
 */
export const course = pgTable(
  "course",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary"),
    outline: text("outline"), // markdown outline
    category: text("category"), // digital_literacy, safety, creative, communication, wpln
    durationLabel: text("duration_label"), // "6 sessions", "8 weeks"
    prerequisites: text("prerequisites"),
    outcomes: jsonb("outcomes").$type<string[]>().default([]),
    isFree: boolean("is_free").notNull().default(true),
    published: boolean("published").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestamps,
  },
);

export const cohortStatus = pgEnum("cohort_status", [
  "draft",
  "in_review",
  "approved",
  "published",
  "registration_open",
  "waitlist_only",
  "registration_closed",
  "in_progress",
  "completed",
  "reporting_complete",
  "archived",
  "cancelled",
]);

/** Scheduled cohort of a course (PRD LMS-001, 10.2). */
export const cohort = pgTable(
  "cohort",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "restrict" }),
    code: text("code").notNull().unique(), // "WORD-2026-B12"
    status: cohortStatus("status").notNull().default("draft"),
    deliveryMode: deliveryMode("delivery_mode").notNull().default("in_person"),
    locale: localeEnum("locale").notNull().default("en"),
    locationName: text("location_name"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    capacity: integer("capacity").notNull().default(30),
    // meeting link released only to enrolled users (PRD LMS-002)
    meetingLink: text("meeting_link"),
    instructorId: text("instructor_id").references(() => person.id),
    coordinatorId: text("coordinator_id").references(() => person.id),
    ...timestamps,
  },
  (t) => [index("cohort_status_idx").on(t.status)],
);

/** Individual session within a cohort (PRD LMS-005). */
export const cohortSession = pgTable(
  "cohort_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    title: text("title"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("session_cohort_idx").on(t.cohortId)],
);

export const applicationStatus = pgEnum("application_status", [
  "draft",
  "submitted",
  "verification_pending",
  "under_review",
  "more_information",
  "approved",
  "waitlisted",
  "declined",
  "withdrawn",
  "archived",
]);

/**
 * Course application (PRD 10.3): separate from enrollment so decisions,
 * status, and attendance are not conflated.
 */
export const courseApplication = pgTable(
  "course_application",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    status: applicationStatus("status").notNull().default("submitted"),
    accessibilityNeeds: text("accessibility_needs"),
    preferredLocale: localeEnum("preferred_locale"),
    decisionReason: text("decision_reason"),
    reviewedById: text("reviewed_by_id").references(() => person.id),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("application_cohort_person_idx").on(t.cohortId, t.personId),
    index("application_status_idx").on(t.status),
  ],
);

export const enrollmentStatus = pgEnum("enrollment_status", [
  "offered",
  "enrolled",
  "transfer_pending",
  "cancelled",
  "withdrawn",
  "completed",
  "did_not_complete",
]);

/** Enrollment reserves capacity only when accepted (PRD 10.3, 10.8). */
export const enrollment = pgTable(
  "enrollment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    status: enrollmentStatus("status").notNull().default("enrolled"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("enrollment_cohort_person_idx").on(t.cohortId, t.personId),
  ],
);

export const attendanceStatus = pgEnum("attendance_status", [
  "expected",
  "checked_in",
  "present",
  "late",
  "excused",
  "no_show",
  "corrected",
]);

/** Per-session attendance (PRD LMS-005, 10.3). */
export const attendance = pgTable(
  "attendance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionId: text("session_id")
      .notNull()
      .references(() => cohortSession.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    status: attendanceStatus("status").notNull().default("expected"),
    // correction requires reason + before/after audit (PRD 10.3)
    correctionReason: text("correction_reason"),
    recordedById: text("recorded_by_id").references(() => person.id),
    recordedAt: timestamp("recorded_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("attendance_session_person_idx").on(t.sessionId, t.personId),
  ],
);

/**
 * Verifiable certificate with public verification code (PRD LMS-011).
 * Exposes only approved fields on public verification.
 */
export const certificate = pgTable(
  "certificate",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollment.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    courseTitle: text("course_title").notNull(),
    recipientName: text("recipient_name").notNull(),
    verificationCode: text("verification_code").notNull().unique(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("certificate_code_idx").on(t.verificationCode)],
);
