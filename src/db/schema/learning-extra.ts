import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";
import { course, cohort, enrollment } from "./learning";

/** Downloadable/offline-permitted learning materials (PRD LMS-007). */
export const learningMaterial = pgTable(
  "learning_material",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id").references(() => course.id, {
      onDelete: "cascade",
    }),
    cohortId: text("cohort_id").references(() => cohort.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url"),
    storageKey: text("storage_key"),
    downloadable: boolean("downloadable").notNull().default(true),
    offlineAllowed: boolean("offline_allowed").notNull().default(true),
    version: integer("version").notNull().default(1),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("material_course_idx").on(t.courseId)],
);

export const assessmentType = pgEnum("assessment_type", [
  "quiz",
  "assignment",
  "practical",
]);

/** Assessment attached to a course (PRD LMS-010). */
export const assessment = pgTable("assessment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: assessmentType("type").notNull().default("quiz"),
  passMark: integer("pass_mark").notNull().default(60), // percentage
  maxAttempts: integer("max_attempts").notNull().default(3),
  published: boolean("published").notNull().default(false),
  ...timestamps,
});

/** A question with choices. answer index stored in `correctIndex`. */
export const assessmentQuestion = pgTable(
  "assessment_question",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessment.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull().default(0),
    prompt: text("prompt").notNull(),
    choices: jsonb("choices").$type<string[]>().notNull().default([]),
    correctIndex: integer("correct_index").notNull().default(0),
    points: integer("points").notNull().default(1),
    ...timestamps,
  },
  (t) => [index("question_assessment_idx").on(t.assessmentId)],
);

export const attemptStatus = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
  "passed",
  "failed",
  "needs_review",
]);

/** A learner's attempt at an assessment. */
export const assessmentAttempt = pgTable(
  "assessment_attempt",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessment.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    enrollmentId: text("enrollment_id").references(() => enrollment.id, {
      onDelete: "set null",
    }),
    status: attemptStatus("status").notNull().default("in_progress"),
    scorePercent: integer("score_percent"),
    answers: jsonb("answers").$type<Record<string, number>>().default({}),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("attempt_person_idx").on(t.personId)],
);

/** Learning pathway: ordered sequence of courses (PRD LMS-012). */
export const learningPath = pgTable("learning_path", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  published: boolean("published").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

export const learningPathStep = pgTable(
  "learning_path_step",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    pathId: text("path_id")
      .notNull()
      .references(() => learningPath.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull().default(0),
  },
  (t) => [uniqueIndex("path_step_idx").on(t.pathId, t.courseId)],
);
