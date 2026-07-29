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


import { product, productVariant } from "@/db/schema";

export async function getPublishedProducts() {
  return db
    .select()
    .from(product)
    .where(eq(product.published, true))
    .orderBy(desc(product.createdAt));
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select()
    .from(product)
    .where(and(eq(product.slug, slug), eq(product.published, true)))
    .limit(1);
  const p = rows[0];
  if (!p) return null;
  const variants = await db
    .select()
    .from(productVariant)
    .where(eq(productVariant.productId, p.id));
  return { product: p, variants };
}


import { ilike, or } from "drizzle-orm";
import { contentItem, contentTranslation, policy } from "@/db/schema";

/** Global search across public content (PRD WEB-004/005). */
export async function searchPublic(q: string) {
  const term = `%${q}%`;
  const [courses, events, opps, services, stories] = await Promise.all([
    db
      .select({ slug: course.slug, title: course.title })
      .from(course)
      .where(and(eq(course.published, true), or(ilike(course.title, term), ilike(course.summary, term))))
      .limit(8),
    db
      .select({ slug: event.slug, title: event.title })
      .from(event)
      .where(or(ilike(event.title, term), ilike(event.description, term)))
      .limit(8),
    db
      .select({ slug: opportunity.slug, title: opportunity.title })
      .from(opportunity)
      .where(and(eq(opportunity.published, true), or(ilike(opportunity.title, term), ilike(opportunity.purpose, term))))
      .limit(8),
    db
      .select({ name: service.name, id: service.id })
      .from(service)
      .where(and(eq(service.published, true), ilike(service.name, term)))
      .limit(8),
    db
      .select({ slug: contentItem.slug, title: contentTranslation.title })
      .from(contentItem)
      .innerJoin(contentTranslation, eq(contentTranslation.contentId, contentItem.id))
      .where(and(eq(contentItem.status, "published"), ilike(contentTranslation.title, term)))
      .limit(8),
  ]);
  return { courses, events, opps, services, stories };
}

/** Published stories/news (PRD 7.1). */
export async function listStories() {
  return db
    .select({ item: contentItem, title: contentTranslation.title, summary: contentTranslation.summary })
    .from(contentItem)
    .innerJoin(contentTranslation, and(eq(contentTranslation.contentId, contentItem.id), eq(contentTranslation.locale, "en")))
    .where(and(eq(contentItem.status, "published"), or(eq(contentItem.type, "story"), eq(contentItem.type, "news"))))
    .orderBy(desc(contentItem.publishedAt))
    .limit(50);
}

/** A single published CMS item by type + slug. */
export async function getContentItem(type: string, slug: string) {
  const rows = await db
    .select({ item: contentItem, tr: contentTranslation })
    .from(contentItem)
    .innerJoin(contentTranslation, and(eq(contentTranslation.contentId, contentItem.id), eq(contentTranslation.locale, "en")))
    .where(and(eq(contentItem.type, type as never), eq(contentItem.slug, slug), eq(contentItem.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

export async function listPublishedPolicies() {
  return db.select().from(policy).where(eq(policy.published, true)).orderBy(policy.title);
}

export async function getPolicyBySlug(slug: string) {
  const rows = await db
    .select()
    .from(policy)
    .where(and(eq(policy.slug, slug), eq(policy.published, true)))
    .limit(1);
  return rows[0] ?? null;
}
