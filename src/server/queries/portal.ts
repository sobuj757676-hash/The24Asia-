import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  courseApplication,
  enrollment,
  cohort,
  course,
  certificate,
  eventRegistration,
  event,
  volunteerApplication,
  volunteerProfile,
  shiftAssignment,
  timeEntry,
  opportunity,
} from "@/db/schema";

export async function getMyApplications(personId: string) {
  return db
    .select({
      application: courseApplication,
      cohort: cohort,
      course: course,
    })
    .from(courseApplication)
    .innerJoin(cohort, eq(courseApplication.cohortId, cohort.id))
    .innerJoin(course, eq(cohort.courseId, course.id))
    .where(eq(courseApplication.personId, personId))
    .orderBy(desc(courseApplication.createdAt))
    .limit(LIST_LIMIT);
}

export async function getMyEnrollments(personId: string) {
  return db
    .select({
      enrollment: enrollment,
      cohort: cohort,
      course: course,
    })
    .from(enrollment)
    .innerJoin(cohort, eq(enrollment.cohortId, cohort.id))
    .innerJoin(course, eq(cohort.courseId, course.id))
    .where(eq(enrollment.personId, personId))
    .orderBy(desc(enrollment.createdAt))
    .limit(LIST_LIMIT);
}

export async function getMyCertificates(personId: string) {
  return db
    .select()
    .from(certificate)
    .where(eq(certificate.personId, personId))
    .orderBy(desc(certificate.issuedAt))
    .limit(LIST_LIMIT);
}

export async function getMyEventRegistrations(personId: string) {
  return db
    .select({ registration: eventRegistration, event: event })
    .from(eventRegistration)
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(eq(eventRegistration.personId, personId))
    .orderBy(desc(event.startsAt))
    .limit(LIST_LIMIT);
}

export async function getMyVolunteerProfile(personId: string) {
  const rows = await db
    .select()
    .from(volunteerProfile)
    .where(eq(volunteerProfile.personId, personId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getMyVolunteerApplications(personId: string) {
  return db
    .select({ application: volunteerApplication, opportunity: opportunity })
    .from(volunteerApplication)
    .leftJoin(
      opportunity,
      eq(volunteerApplication.opportunityId, opportunity.id),
    )
    .where(eq(volunteerApplication.personId, personId))
    .orderBy(desc(volunteerApplication.createdAt))
    .limit(LIST_LIMIT);
}

export async function getMyShifts(personId: string) {
  return db
    .select({ shift: shiftAssignment, event: event })
    .from(shiftAssignment)
    .leftJoin(event, eq(shiftAssignment.eventId, event.id))
    .where(eq(shiftAssignment.personId, personId))
    .orderBy(desc(shiftAssignment.startsAt))
    .limit(LIST_LIMIT);
}

export async function getMyHours(personId: string) {
  return db
    .select()
    .from(timeEntry)
    .where(eq(timeEntry.personId, personId))
    .orderBy(desc(timeEntry.activityDate))
    .limit(LIST_LIMIT);
}

export async function hasApplied(personId: string, cohortId: string) {
  const rows = await db
    .select({ id: courseApplication.id })
    .from(courseApplication)
    .where(
      and(
        eq(courseApplication.personId, personId),
        eq(courseApplication.cohortId, cohortId),
      ),
    )
    .limit(1);
  return !!rows[0];
}


import { recognition } from "@/db/schema";
import { gte, sql } from "drizzle-orm";

export async function getMyRecognition(personId: string) {
  return db
    .select()
    .from(recognition)
    .where(eq(recognition.personId, personId))
    .orderBy(desc(recognition.awardedAt))
    .limit(LIST_LIMIT);
}

/** Upcoming events a volunteer can sign up to help at (VOL-009). */
export async function getUpcomingEventsForSignup(personId: string) {
  const signedUp = await db
    .select({ eventId: shiftAssignment.eventId })
    .from(shiftAssignment)
    .where(eq(shiftAssignment.personId, personId));
  const takenIds = new Set(signedUp.map((s) => s.eventId).filter(Boolean));
  const upcoming = await db
    .select()
    .from(event)
    .where(
      and(
        gte(event.startsAt, new Date()),
        sql`${event.status} = ANY(ARRAY['published','registration_open','registration_closed','in_progress']::event_status[])`,
      ),
    )
    .orderBy(event.startsAt)
    .limit(20);
  return upcoming.filter((e) => !takenIds.has(e.id));
}


import {
  attendance,
  cohortSession,
  assessmentAttempt,
  assessment,
  course as courseTable,
} from "@/db/schema";

/** Safety cap so no list query can return an unbounded result set. */
const LIST_LIMIT = 500;

/** Learner attendance history (PRD LMS-013). */
export async function getMyAttendance(personId: string) {
  return db
    .select({
      attendance,
      sessionTitle: cohortSession.title,
      startsAt: cohortSession.startsAt,
      courseTitle: courseTable.title,
    })
    .from(attendance)
    .innerJoin(cohortSession, eq(attendance.sessionId, cohortSession.id))
    .innerJoin(cohort, eq(cohortSession.cohortId, cohort.id))
    .innerJoin(courseTable, eq(cohort.courseId, courseTable.id))
    .where(eq(attendance.personId, personId))
    .orderBy(desc(cohortSession.startsAt))
    .limit(LIST_LIMIT);
}

/** Assessment attempt history (PRD LMS-013). */
export async function getMyAttempts(personId: string) {
  return db
    .select({ attempt: assessmentAttempt, title: assessment.title })
    .from(assessmentAttempt)
    .innerJoin(assessment, eq(assessmentAttempt.assessmentId, assessment.id))
    .where(eq(assessmentAttempt.personId, personId))
    .orderBy(desc(assessmentAttempt.createdAt))
    .limit(LIST_LIMIT);
}

/** Recommend published courses the learner is not yet enrolled in (LMS-013). */
export async function getRecommendedCourses(personId: string) {
  const mine = await db
    .select({ courseId: cohort.courseId })
    .from(enrollment)
    .innerJoin(cohort, eq(enrollment.cohortId, cohort.id))
    .where(eq(enrollment.personId, personId));
  const taken = new Set(mine.map((m) => m.courseId));
  const all = await db
    .select()
    .from(courseTable)
    .where(eq(courseTable.published, true))
    .orderBy(courseTable.displayOrder)
    .limit(12);
  return all.filter((c) => !taken.has(c.id)).slice(0, 3);
}


/**
 * Ids of the cohorts a person has already applied to. Returned as a Set so a
 * course page can label each batch correctly in a single round trip instead of
 * one `hasApplied` query per batch.
 */
export async function getAppliedCohortIds(personId: string) {
  const rows = await db
    .select({ cohortId: courseApplication.cohortId })
    .from(courseApplication)
    .where(eq(courseApplication.personId, personId));
  return new Set(rows.map((r) => r.cohortId));
}

/** Registration status per event for the signed-in person. */
export async function getMyRegistrationStatusMap(personId: string) {
  const rows = await db
    .select({
      eventId: eventRegistration.eventId,
      status: eventRegistration.status,
    })
    .from(eventRegistration)
    .where(eq(eventRegistration.personId, personId));
  return new Map(rows.map((r) => [r.eventId, r.status]));
}
