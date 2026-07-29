import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  assessment,
  assessmentQuestion,
  course,
  cohort,
  enrollment,
  certificate,
  person,
  learningPath,
  learningPathStep,
  learningMaterial,
} from "@/db/schema";

/* --------------------------------------------------------- admin queries */

export async function listAssessments() {
  return db
    .select({ assessment, courseTitle: course.title })
    .from(assessment)
    .innerJoin(course, eq(assessment.courseId, course.id))
    .orderBy(desc(assessment.createdAt));
}

export async function getAssessmentWithQuestions(id: string) {
  const [a] = await db.select().from(assessment).where(eq(assessment.id, id)).limit(1);
  if (!a) return null;
  const questions = await db
    .select()
    .from(assessmentQuestion)
    .where(eq(assessmentQuestion.assessmentId, id))
    .orderBy(assessmentQuestion.sequence);
  return { assessment: a, questions };
}

/** Enrollments eligible for certificate issuance (not yet certified). */
export async function enrollmentsForCerts() {
  const certRows = await db.select({ enrollmentId: certificate.enrollmentId }).from(certificate);
  const certified = new Set(certRows.map((c) => c.enrollmentId));
  const rows = await db
    .select({
      enrollmentId: enrollment.id,
      status: enrollment.status,
      personName: person.displayName,
      courseTitle: course.title,
      code: cohort.code,
    })
    .from(enrollment)
    .innerJoin(cohort, eq(enrollment.cohortId, cohort.id))
    .innerJoin(course, eq(cohort.courseId, course.id))
    .innerJoin(person, eq(enrollment.personId, person.id))
    .orderBy(desc(enrollment.createdAt))
    .limit(200);
  return rows.filter((r) => !certified.has(r.enrollmentId));
}

export async function listCertificates() {
  return db.select().from(certificate).orderBy(desc(certificate.issuedAt)).limit(200);
}

/* -------------------------------------------------------- learner queries */

/** Published assessments for the courses a learner is enrolled in. */
export async function availableAssessments(personId: string) {
  const enrolled = await db
    .select({ courseId: cohort.courseId })
    .from(enrollment)
    .innerJoin(cohort, eq(enrollment.cohortId, cohort.id))
    .where(eq(enrollment.personId, personId));
  const courseIds = [...new Set(enrolled.map((e) => e.courseId))];
  if (courseIds.length === 0) return [];
  return db
    .select({ assessment, courseTitle: course.title })
    .from(assessment)
    .innerJoin(course, eq(assessment.courseId, course.id))
    .where(and(eq(assessment.published, true), inArray(assessment.courseId, courseIds)));
}

export async function getPublishedAssessment(id: string) {
  const [a] = await db
    .select()
    .from(assessment)
    .where(and(eq(assessment.id, id), eq(assessment.published, true)))
    .limit(1);
  if (!a) return null;
  const questions = await db
    .select({
      id: assessmentQuestion.id,
      prompt: assessmentQuestion.prompt,
      choices: assessmentQuestion.choices,
      sequence: assessmentQuestion.sequence,
    })
    .from(assessmentQuestion)
    .where(eq(assessmentQuestion.assessmentId, id))
    .orderBy(assessmentQuestion.sequence);
  return { assessment: a, questions };
}

export async function materialsForPerson(personId: string) {
  const enrolled = await db
    .select({ courseId: cohort.courseId })
    .from(enrollment)
    .innerJoin(cohort, eq(enrollment.cohortId, cohort.id))
    .where(eq(enrollment.personId, personId));
  const courseIds = [...new Set(enrolled.map((e) => e.courseId))];
  if (courseIds.length === 0) return [];
  return db
    .select()
    .from(learningMaterial)
    .where(inArray(learningMaterial.courseId, courseIds))
    .orderBy(learningMaterial.displayOrder);
}

/* --------------------------------------------------------- pathways */

export async function listPathwaysPublished() {
  return db
    .select()
    .from(learningPath)
    .where(eq(learningPath.published, true))
    .orderBy(learningPath.displayOrder);
}

export async function listPathwaysAll() {
  return db.select().from(learningPath).orderBy(learningPath.displayOrder);
}

export async function getPathwayBySlug(slug: string) {
  const [p] = await db.select().from(learningPath).where(eq(learningPath.slug, slug)).limit(1);
  if (!p) return null;
  const steps = await db
    .select({ step: learningPathStep, course })
    .from(learningPathStep)
    .innerJoin(course, eq(learningPathStep.courseId, course.id))
    .where(eq(learningPathStep.pathId, p.id))
    .orderBy(learningPathStep.sequence);
  return { path: p, steps };
}

export async function listMaterialsAll() {
  return db
    .select({ material: learningMaterial, courseTitle: course.title })
    .from(learningMaterial)
    .leftJoin(course, eq(learningMaterial.courseId, course.id))
    .orderBy(desc(learningMaterial.createdAt));
}


import { cohortSession, attendance } from "@/db/schema";

export async function getCohortDetail(cohortId: string) {
  const rows = await db
    .select({ cohort, course })
    .from(cohort)
    .innerJoin(course, eq(cohort.courseId, course.id))
    .where(eq(cohort.id, cohortId))
    .limit(1);
  if (!rows[0]) return null;
  const sessions = await db
    .select()
    .from(cohortSession)
    .where(eq(cohortSession.cohortId, cohortId))
    .orderBy(cohortSession.sequence);
  return { ...rows[0], sessions };
}

/** Roster for a session: enrolled learners + their attendance status. */
export async function getSessionRoster(sessionId: string) {
  const [sess] = await db
    .select()
    .from(cohortSession)
    .where(eq(cohortSession.id, sessionId))
    .limit(1);
  if (!sess) return null;

  const learners = await db
    .select({ personId: enrollment.personId, name: person.displayName })
    .from(enrollment)
    .innerJoin(person, eq(enrollment.personId, person.id))
    .where(
      and(
        eq(enrollment.cohortId, sess.cohortId),
        // active enrolments only
        inArray(enrollment.status, ["enrolled", "offered", "completed"] as never),
      ),
    );

  const marks = await db
    .select({ personId: attendance.personId, status: attendance.status })
    .from(attendance)
    .where(eq(attendance.sessionId, sessionId));
  const markMap = new Map(marks.map((m) => [m.personId, m.status]));

  return {
    session: sess,
    roster: learners.map((l) => ({ ...l, status: markMap.get(l.personId) ?? "expected" })),
  };
}
