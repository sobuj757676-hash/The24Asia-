import "server-only";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  course,
  cohort,
  courseApplication,
  enrollment,
  event,
  eventRegistration,
  opportunity,
  volunteerApplication,
  person,
  auditEvent,
  featureFlag,
  inquiry,
  impactMetric,
} from "@/db/schema";

export async function getAdminKpis() {
  const [people, activeEnroll, volunteers, upcoming] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(person),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(enrollment)
      .where(sql`${enrollment.status} = ANY(ARRAY['enrolled','offered']::enrollment_status[])`),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(volunteerApplication)
      .where(eq(volunteerApplication.status, "approved")),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(event)
      .where(gte(event.startsAt, new Date())),
  ]);
  return {
    people: people[0]?.n ?? 0,
    activeEnrollments: activeEnroll[0]?.n ?? 0,
    volunteers: volunteers[0]?.n ?? 0,
    upcomingEvents: upcoming[0]?.n ?? 0,
  };
}

export async function getPublicImpactMetricsAdmin() {
  return db.select().from(impactMetric).orderBy(impactMetric.displayOrder);
}

export async function getAllCourses() {
  return db.select().from(course).orderBy(course.displayOrder);
}

export async function getAllCohorts() {
  return db
    .select({ cohort, course })
    .from(cohort)
    .innerJoin(course, eq(cohort.courseId, course.id))
    .orderBy(desc(cohort.startDate));
}

/** Pending course applications for review (PRD LMS-004). */
export async function getPendingApplications() {
  return db
    .select({
      application: courseApplication,
      person: person,
      cohort: cohort,
      course: course,
    })
    .from(courseApplication)
    .innerJoin(person, eq(courseApplication.personId, person.id))
    .innerJoin(cohort, eq(courseApplication.cohortId, cohort.id))
    .innerJoin(course, eq(cohort.courseId, course.id))
    .where(
      sql`${courseApplication.status} = ANY(ARRAY['submitted','under_review','verification_pending','more_information']::application_status[])`,
    )
    .orderBy(desc(courseApplication.createdAt));
}

export async function getAllEvents() {
  return db.select().from(event).orderBy(desc(event.startsAt));
}

export async function getEventRegistrationCounts(eventId: string) {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(eventRegistration)
    .where(eq(eventRegistration.eventId, eventId));
  return rows[0]?.n ?? 0;
}

export async function getPendingVolunteerApplications() {
  return db
    .select({
      application: volunteerApplication,
      person: person,
      opportunity: opportunity,
    })
    .from(volunteerApplication)
    .innerJoin(person, eq(volunteerApplication.personId, person.id))
    .leftJoin(opportunity, eq(volunteerApplication.opportunityId, opportunity.id))
    .where(
      sql`${volunteerApplication.status} = ANY(ARRAY['submitted','under_review','interview','screening_pending','more_information']::volunteer_application_status[])`,
    )
    .orderBy(desc(volunteerApplication.createdAt));
}

export async function getPeople(limit = 100) {
  return db.select().from(person).orderBy(desc(person.createdAt)).limit(limit);
}

export async function getRecentAudit(limit = 100) {
  return db
    .select()
    .from(auditEvent)
    .orderBy(desc(auditEvent.occurredAt))
    .limit(limit);
}

export async function getFlags() {
  return db.select().from(featureFlag).orderBy(featureFlag.key);
}

export async function getInquiries() {
  return db.select().from(inquiry).orderBy(desc(inquiry.createdAt)).limit(100);
}
