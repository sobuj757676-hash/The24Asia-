import "server-only";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  course,
  cohort,
  event,
  opportunity,
  impactMetric,
  service,
  liveShowEpisode,
  partner,
  award,
  certificate,
  enrollment,
} from "@/db/schema";

export async function getPublishedImpactMetrics() {
  return db
    .select()
    .from(impactMetric)
    .where(eq(impactMetric.publishedPublicly, true))
    .orderBy(asc(impactMetric.displayOrder));
}

export async function getPublishedCourses() {
  return db
    .select()
    .from(course)
    .where(eq(course.published, true))
    .orderBy(asc(course.displayOrder));
}

export async function getCourseBySlug(slug: string) {
  const rows = await db
    .select()
    .from(course)
    .where(and(eq(course.slug, slug), eq(course.published, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** Open cohorts, optionally for a specific course. */
export async function getOpenCohorts(courseId?: string) {
  const rows = await db
    .select({
      cohort: cohort,
      course: course,
    })
    .from(cohort)
    .innerJoin(course, eq(cohort.courseId, course.id))
    .where(
      and(
        courseId ? eq(cohort.courseId, courseId) : undefined,
        sql`${cohort.status} = ANY(ARRAY['published','registration_open','waitlist_only']::cohort_status[])`,
      ),
    )
    .orderBy(asc(cohort.startDate));
  return rows;
}

export async function getUpcomingEvents(limit = 12) {
  return db
    .select()
    .from(event)
    .where(
      and(
        gte(event.startsAt, new Date()),
        sql`${event.status} = ANY(ARRAY['published','registration_open','registration_closed','in_progress']::event_status[])`,
      ),
    )
    .orderBy(asc(event.startsAt))
    .limit(limit);
}

export async function getEventBySlug(slug: string) {
  const rows = await db.select().from(event).where(eq(event.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getPublishedOpportunities() {
  return db
    .select()
    .from(opportunity)
    .where(eq(opportunity.published, true))
    .orderBy(desc(opportunity.createdAt));
}

export async function getPublishedServices() {
  return db
    .select()
    .from(service)
    .where(eq(service.published, true))
    .orderBy(desc(service.isUrgentHelp));
}

export async function getUrgentHelpServices() {
  return db
    .select()
    .from(service)
    .where(and(eq(service.published, true), eq(service.isUrgentHelp, true)));
}

export async function getPublishedEpisodes(limit = 60) {
  return db
    .select()
    .from(liveShowEpisode)
    .where(eq(liveShowEpisode.published, true))
    .orderBy(desc(liveShowEpisode.episodeNumber))
    .limit(limit);
}

export async function getPublicPartners() {
  return db
    .select()
    .from(partner)
    .where(eq(partner.displayPublicly, true))
    .orderBy(asc(partner.displayOrder));
}

export async function getAwards() {
  return db.select().from(award).orderBy(asc(award.displayOrder));
}

/** Certificate verification (PRD LMS-011): exposes only approved fields. */
export async function verifyCertificate(code: string) {
  const rows = await db
    .select({
      courseTitle: certificate.courseTitle,
      recipientName: certificate.recipientName,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
    })
    .from(certificate)
    .where(eq(certificate.verificationCode, code.trim().toUpperCase()))
    .limit(1);
  return rows[0] ?? null;
}

/** Count enrollments for a cohort to show capacity state. */
export async function getCohortFilled(cohortId: string) {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.cohortId, cohortId),
        sql`${enrollment.status} = ANY(ARRAY['offered','enrolled','completed']::enrollment_status[])`,
      ),
    );
  return rows[0]?.count ?? 0;
}
