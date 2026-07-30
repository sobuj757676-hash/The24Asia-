import "server-only";
import { and, desc, eq, gte, sql } from "drizzle-orm";
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


/* ------------------------------------------------ management list queries */
import {
  service,
  partner,
  liveShowEpisode,
  product,
  productVariant,
  policy,
  contentItem,
  contentTranslation,
  cohortSession,
  newsletterCampaign,
  incident,
  risk,
  expenseClaim,
  supportRequest,
} from "@/db/schema";

export async function listServices() {
  return db.select().from(service).orderBy(desc(service.createdAt));
}
export async function listMetrics() {
  return db.select().from(impactMetric).orderBy(impactMetric.displayOrder);
}
export async function listPartners() {
  return db.select().from(partner).orderBy(partner.displayOrder);
}
export async function listEpisodes() {
  return db
    .select()
    .from(liveShowEpisode)
    .orderBy(desc(liveShowEpisode.episodeNumber));
}
export async function listOpportunitiesAll() {
  return db.select().from(opportunity).orderBy(desc(opportunity.createdAt));
}
export async function listPolicies() {
  return db.select().from(policy).orderBy(desc(policy.createdAt));
}
export async function listCampaigns() {
  return db
    .select()
    .from(newsletterCampaign)
    .orderBy(desc(newsletterCampaign.createdAt));
}
export async function listIncidents() {
  return db.select().from(incident).orderBy(desc(incident.createdAt));
}
export async function listRisks() {
  return db.select().from(risk).orderBy(desc(risk.createdAt));
}
export async function listExpenses() {
  return db.select().from(expenseClaim).orderBy(desc(expenseClaim.createdAt));
}
export async function listSupportRequests() {
  return db
    .select()
    .from(supportRequest)
    .orderBy(desc(supportRequest.createdAt));
}

export async function listCohortSessions(cohortId: string) {
  return db
    .select()
    .from(cohortSession)
    .where(eq(cohortSession.cohortId, cohortId))
    .orderBy(cohortSession.sequence);
}

export async function listProductsWithVariants() {
  const products = await db.select().from(product).orderBy(desc(product.createdAt));
  const variants = await db.select().from(productVariant);
  return products.map((p) => ({
    product: p,
    variants: variants.filter((v) => v.productId === p.id),
  }));
}

export async function listContentPages() {
  return db
    .select({
      item: contentItem,
      title: contentTranslation.title,
    })
    .from(contentItem)
    .leftJoin(
      contentTranslation,
      and(
        eq(contentTranslation.contentId, contentItem.id),
        eq(contentTranslation.locale, "en"),
      ),
    )
    .orderBy(desc(contentItem.createdAt));
}

export async function getContentForEdit(id: string) {
  const rows = await db
    .select({ item: contentItem, tr: contentTranslation })
    .from(contentItem)
    .leftJoin(
      contentTranslation,
      and(
        eq(contentTranslation.contentId, contentItem.id),
        eq(contentTranslation.locale, "en"),
      ),
    )
    .where(eq(contentItem.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getById<T extends { id: string }>(
  rows: T[],
  id?: string,
) {
  if (!id) return null;
  return rows.find((r) => r.id === id) ?? null;
}


import { user as authUser, roleAssignment } from "@/db/schema";

export async function listUsersWithRoles() {
  const users = await db
    .select({
      userId: authUser.id,
      email: authUser.email,
      name: authUser.name,
      personId: person.id,
      displayName: person.displayName,
    })
    .from(authUser)
    .leftJoin(person, eq(person.userId, authUser.id))
    .orderBy(desc(authUser.createdAt))
    .limit(200);

  const roles = await db
    .select({
      id: roleAssignment.id,
      personId: roleAssignment.personId,
      role: roleAssignment.role,
    })
    .from(roleAssignment);

  return users.map((u) => ({
    ...u,
    roles: roles.filter((r) => r.personId === u.personId),
  }));
}


import { donation, shopOrder, campaign } from "@/db/schema";

export async function listDonations() {
  return db.select().from(donation).orderBy(desc(donation.createdAt)).limit(200);
}
export async function listOrders() {
  return db.select().from(shopOrder).orderBy(desc(shopOrder.createdAt)).limit(200);
}
export async function listCampaignsAll() {
  return db.select().from(campaign).orderBy(desc(campaign.createdAt));
}
export async function getFinanceTotals() {
  const [donated] = await db
    .select({ total: sql<number>`coalesce(sum(${donation.amountCents}),0)::int` })
    .from(donation)
    .where(eq(donation.status, "completed"));
  return { donatedCents: donated?.total ?? 0 };
}


import { timeEntry } from "@/db/schema";

export async function listPendingHours() {
  return db
    .select({ entry: timeEntry, personName: person.displayName })
    .from(timeEntry)
    .leftJoin(person, eq(timeEntry.personId, person.id))
    .where(eq(timeEntry.approved, false))
    .orderBy(desc(timeEntry.createdAt));
}


export async function getEventRoster(eventId: string) {
  const [ev] = await db.select().from(event).where(eq(event.id, eventId)).limit(1);
  if (!ev) return null;
  const regs = await db
    .select({ reg: eventRegistration, name: person.displayName })
    .from(eventRegistration)
    .leftJoin(person, eq(eventRegistration.personId, person.id))
    .where(eq(eventRegistration.eventId, eventId))
    .orderBy(desc(eventRegistration.createdAt));
  return { event: ev, registrations: regs };
}


import {
  volunteerProfile,
  timeEntry as timeEntryTable,
  attendance as attendanceTable,
} from "@/db/schema";

export async function getReportMetrics() {
  const scalar = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;

  const [
    apps,
    approvedApps,
    enrolled,
    completed,
    present,
    totalMarks,
    volApps,
    activeVols,
    approvedHours,
    donatedCents,
    donationCount,
    publishedCourses,
    publishedContent,
  ] = await Promise.all([
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(courseApplication)),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(courseApplication).where(eq(courseApplication.status, "approved"))),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(enrollment)),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(enrollment).where(eq(enrollment.status, "completed"))),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(attendanceTable).where(sql`${attendanceTable.status} in ('present','checked_in','late')`)),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(attendanceTable)),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(volunteerApplication)),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(volunteerProfile).where(eq(volunteerProfile.standing, "active"))),
    scalar(db.select({ n: sql<number>`coalesce(sum(${timeEntryTable.hours}),0)::int` }).from(timeEntryTable).where(eq(timeEntryTable.approved, true))),
    scalar(db.select({ n: sql<number>`coalesce(sum(${donation.amountCents}),0)::int` }).from(donation).where(eq(donation.status, "completed"))),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(donation).where(eq(donation.status, "completed"))),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(course).where(eq(course.published, true))),
    scalar(db.select({ n: sql<number>`count(*)::int` }).from(contentItem).where(eq(contentItem.status, "published"))),
  ]);

  return {
    programs: { apps, approvedApps, enrolled, completed },
    attendance: { present, totalMarks, rate: totalMarks ? Math.round((present / totalMarks) * 100) : 0 },
    volunteers: { volApps, activeVols, approvedHours },
    donations: { donatedCents, donationCount },
    content: { publishedCourses, publishedContent },
  };
}


export async function listActiveVolunteers() {
  return db
    .select({ personId: volunteerProfile.personId, name: person.displayName, standing: volunteerProfile.standing })
    .from(volunteerProfile)
    .innerJoin(person, eq(volunteerProfile.personId, person.id))
    .orderBy(person.displayName);
}


/**
 * Registration counts for many events in ONE query.
 * Replaces the previous per-event count (an N+1 that issued one round-trip per
 * row and grew linearly with the events list).
 */
export async function getEventRegistrationCountMap(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      eventId: eventRegistration.eventId,
      n: sql<number>`count(*)::int`,
    })
    .from(eventRegistration)
    .groupBy(eventRegistration.eventId);
  return new Map(rows.map((r) => [r.eventId, r.n]));
}
