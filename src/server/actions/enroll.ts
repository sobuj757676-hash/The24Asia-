"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  courseApplication,
  cohort,
  event,
  eventRegistration,
  volunteerApplication,
  opportunity,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { ensurePerson } from "@/lib/auth/onboarding";
import { audit } from "@/lib/audit";

export type ActionState = { ok: boolean; error?: string; message?: string };

/** Cohort states that still accept applications (waitlist_only included). */
const COHORT_OPEN = new Set([
  "published",
  "registration_open",
  "waitlist_only",
]);

/** Event states that still accept registrations. */
const EVENT_OPEN = new Set(["published", "registration_open"]);

/** Apply to a training cohort (PRD LMS-003). Idempotent per person+cohort. */
export async function applyToCohort(
  cohortId: string,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({
      cohortId: z.string().min(1),
      accessibilityNeeds: z.string().max(1000).optional(),
    })
    .safeParse({
      cohortId,
      accessibilityNeeds: formData.get("accessibilityNeeds") || undefined,
    });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const user = await requireUser();
  const personId = user.personId || (await ensurePerson(user.userId, user.name));

  // Never accept an application into a batch that is not open — previously any
  // cohort id, including a cancelled or completed batch, was accepted.
  const [batch] = await db
    .select({ status: cohort.status, code: cohort.code })
    .from(cohort)
    .where(eq(cohort.id, cohortId))
    .limit(1);
  if (!batch) return { ok: false, error: "That batch no longer exists." };
  if (!COHORT_OPEN.has(batch.status)) {
    return {
      ok: false,
      error:
        "This batch is not accepting applications any more. Please choose another date from the training calendar.",
    };
  }

  const existing = await db
    .select({ id: courseApplication.id })
    .from(courseApplication)
    .where(
      and(
        eq(courseApplication.personId, personId),
        eq(courseApplication.cohortId, cohortId),
      ),
    )
    .limit(1);
  if (existing[0]) {
    return { ok: true, message: "You have already applied to this batch." };
  }

  const [row] = await db
    .insert(courseApplication)
    .values({
      cohortId,
      personId,
      status: "submitted",
      accessibilityNeeds: parsed.data.accessibilityNeeds,
    })
    .returning({ id: courseApplication.id });

  await audit({
    actorId: personId,
    action: "course_application.submitted",
    objectType: "course_application",
    objectId: row.id,
  });

  return {
    ok: true,
    message:
      "Application submitted. We'll confirm your place by email or phone — you can track it in your account.",
  };
}

/** Register for an event (PRD EVT-002), with capacity-aware waitlisting. */
export async function registerForEvent(
  eventId: string,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const personId = user.personId || (await ensurePerson(user.userId, user.name));

  // An unchecked checkbox submits nothing at all, so the previous
  // `!== "off"` test recorded photo consent as GRANTED for people who
  // explicitly opted out. Consent must be an opt-in equality check.
  const allowPhoto = formData.get("allowPhoto") === "on";
  const guests = Math.min(
    Math.max(Number(formData.get("guests") ?? 0) || 0, 0),
    5,
  );

  const [ev] = await db
    .select({
      status: event.status,
      startsAt: event.startsAt,
      capacity: event.capacity,
      allowGuests: event.allowGuests,
    })
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);
  if (!ev) return { ok: false, error: "That event no longer exists." };
  if (!EVENT_OPEN.has(ev.status)) {
    return {
      ok: false,
      error: "Registration for this event is closed.",
    };
  }
  if (ev.startsAt.getTime() < Date.now()) {
    return { ok: false, error: "This event has already started." };
  }

  const existing = await db
    .select({ id: eventRegistration.id, status: eventRegistration.status })
    .from(eventRegistration)
    .where(
      and(
        eq(eventRegistration.personId, personId),
        eq(eventRegistration.eventId, eventId),
      ),
    )
    .limit(1);
  if (existing[0]) {
    return {
      ok: true,
      message:
        existing[0].status === "waitlisted"
          ? "You are already on the waitlist for this event."
          : "You are already registered.",
    };
  }

  // Count live registrations to decide register vs waitlist.
  let waitlisted = false;
  if (ev.capacity != null) {
    const [{ taken }] = await db
      .select({ taken: sql<number>`count(*)::int` })
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, eventId),
          sql`${eventRegistration.status} = ANY(ARRAY['registered','checked_in','attended']::registration_status[])`,
        ),
      );
    waitlisted = taken >= ev.capacity;
  }

  const [row] = await db
    .insert(eventRegistration)
    .values({
      eventId,
      personId,
      status: waitlisted ? "waitlisted" : "registered",
      guests: ev.allowGuests ? guests : 0,
      allowPhoto,
    })
    .returning({ id: eventRegistration.id });

  await audit({
    actorId: personId,
    action: waitlisted ? "event.waitlisted" : "event.registered",
    objectType: "event_registration",
    objectId: row.id,
  });

  return {
    ok: true,
    message: waitlisted
      ? "This event is full, so you're on the waitlist. We'll message you if a place opens up."
      : "You are registered. See you there!",
  };
}

/** Apply to a volunteer opportunity (PRD VOL-002/003). */
export async function applyToOpportunity(
  slug: string,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const personId = user.personId || (await ensurePerson(user.userId, user.name));

  // Only published roles are open — an unpublished draft was previously
  // applyable by anyone who knew or guessed its slug.
  const opp = await db
    .select({ id: opportunity.id, published: opportunity.published })
    .from(opportunity)
    .where(eq(opportunity.slug, slug))
    .limit(1);
  if (!opp[0] || !opp[0].published) {
    return { ok: false, error: "This role is no longer open." };
  }

  const motivation = String(formData.get("motivation") ?? "").trim().slice(0, 2000);
  if (motivation.length < 10) {
    return {
      ok: false,
      error: "Please tell us a little about why you'd like this role.",
    };
  }

  // One open application per role, so coordinators don't review duplicates.
  const existing = await db
    .select({ id: volunteerApplication.id, status: volunteerApplication.status })
    .from(volunteerApplication)
    .where(
      and(
        eq(volunteerApplication.personId, personId),
        eq(volunteerApplication.opportunityId, opp[0].id),
      ),
    )
    .limit(1);
  if (existing[0] && existing[0].status !== "withdrawn") {
    return {
      ok: true,
      message: "You have already applied for this role — check your applications.",
    };
  }

  const [row] = await db
    .insert(volunteerApplication)
    .values({
      opportunityId: opp[0].id,
      personId,
      status: "submitted",
      motivation,
    })
    .returning({ id: volunteerApplication.id });

  await audit({
    actorId: personId,
    action: "volunteer_application.submitted",
    objectType: "volunteer_application",
    objectId: row.id,
  });

  return {
    ok: true,
    message: "Volunteer application submitted. Every application gets a reply.",
  };
}
