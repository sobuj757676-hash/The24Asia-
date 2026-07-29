"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  courseApplication,
  eventRegistration,
  volunteerApplication,
  opportunity,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { ensurePerson } from "@/lib/auth/onboarding";
import { audit } from "@/lib/audit";

export type ActionState = { ok: boolean; error?: string; message?: string };

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

  return { ok: true, message: "Application submitted." };
}

/** Register for an event (PRD EVT-002). */
export async function registerForEvent(
  eventId: string,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const personId = user.personId || (await ensurePerson(user.userId, user.name));

  const allowPhoto = formData.get("allowPhoto") !== "off";

  const existing = await db
    .select({ id: eventRegistration.id })
    .from(eventRegistration)
    .where(
      and(
        eq(eventRegistration.personId, personId),
        eq(eventRegistration.eventId, eventId),
      ),
    )
    .limit(1);
  if (existing[0]) {
    return { ok: true, message: "You are already registered." };
  }

  const [row] = await db
    .insert(eventRegistration)
    .values({ eventId, personId, status: "registered", allowPhoto })
    .returning({ id: eventRegistration.id });

  await audit({
    actorId: personId,
    action: "event.registered",
    objectType: "event_registration",
    objectId: row.id,
  });

  return { ok: true, message: "You are registered. See you there!" };
}

/** Apply to a volunteer opportunity (PRD VOL-002/003). */
export async function applyToOpportunity(
  slug: string,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const personId = user.personId || (await ensurePerson(user.userId, user.name));

  const opp = await db
    .select({ id: opportunity.id })
    .from(opportunity)
    .where(eq(opportunity.slug, slug))
    .limit(1);
  if (!opp[0]) return { ok: false, error: "Opportunity not found." };

  const motivation = String(formData.get("motivation") ?? "").slice(0, 2000);

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

  return { ok: true, message: "Volunteer application submitted." };
}
