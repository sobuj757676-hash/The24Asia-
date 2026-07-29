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
    .orderBy(desc(courseApplication.createdAt));
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
    .orderBy(desc(enrollment.createdAt));
}

export async function getMyCertificates(personId: string) {
  return db
    .select()
    .from(certificate)
    .where(eq(certificate.personId, personId))
    .orderBy(desc(certificate.issuedAt));
}

export async function getMyEventRegistrations(personId: string) {
  return db
    .select({ registration: eventRegistration, event: event })
    .from(eventRegistration)
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(eq(eventRegistration.personId, personId))
    .orderBy(desc(event.startsAt));
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
    .orderBy(desc(volunteerApplication.createdAt));
}

export async function getMyShifts(personId: string) {
  return db
    .select({ shift: shiftAssignment, event: event })
    .from(shiftAssignment)
    .leftJoin(event, eq(shiftAssignment.eventId, event.id))
    .where(eq(shiftAssignment.personId, personId))
    .orderBy(desc(shiftAssignment.startsAt));
}

export async function getMyHours(personId: string) {
  return db
    .select()
    .from(timeEntry)
    .where(eq(timeEntry.personId, personId))
    .orderBy(desc(timeEntry.activityDate));
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
