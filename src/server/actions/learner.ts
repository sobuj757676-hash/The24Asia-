"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  enrollment,
  courseApplication,
  eventRegistration,
  person,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { routing } from "@/i18n/routing";

/** Learner withdraws from a course enrolment (PRD LMS-003). */
export async function withdrawEnrollment(enrollmentId: string) {
  const user = await requireUser();
  await db
    .update(enrollment)
    .set({ status: "withdrawn" })
    .where(and(eq(enrollment.id, enrollmentId), eq(enrollment.personId, user.personId)));
  await audit({
    actorId: user.personId,
    action: "enrollment.withdrawn",
    objectType: "enrollment",
    objectId: enrollmentId,
  });
  revalidatePath("/account/courses");
}

/** Learner withdraws a pending course application (PRD LMS-003). */
export async function withdrawApplication(applicationId: string) {
  const user = await requireUser();
  await db
    .update(courseApplication)
    .set({ status: "withdrawn" })
    .where(and(eq(courseApplication.id, applicationId), eq(courseApplication.personId, user.personId)));
  await audit({
    actorId: user.personId,
    action: "course_application.withdrawn",
    objectType: "course_application",
    objectId: applicationId,
  });
  revalidatePath("/account");
}

/** Cancel an event registration (PRD EVT-004). */
export async function cancelEventRegistration(registrationId: string, reason?: string) {
  const user = await requireUser();
  await db
    .update(eventRegistration)
    .set({ status: "cancelled", cancellationReason: reason ?? null })
    .where(and(eq(eventRegistration.id, registrationId), eq(eventRegistration.personId, user.personId)));
  await audit({
    actorId: user.personId,
    action: "event_registration.cancelled",
    objectType: "event_registration",
    objectId: registrationId,
  });
  revalidatePath("/account/events");
}

/** Edit profile: name, accessibility needs, languages, preferred locale (IAM-004). */
export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const displayName = String(formData.get("displayName") ?? "").slice(0, 200) || null;
  const accessibilityNeeds = String(formData.get("accessibilityNeeds") ?? "").slice(0, 1000) || null;
  const nationality = String(formData.get("nationality") ?? "").slice(0, 80) || null;
  const languagesSpoken = String(formData.get("languagesSpoken") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const rawLocale = String(formData.get("preferredLocale") ?? "en");
  const preferredLocale = (routing.locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as (typeof routing.locales)[number])
    : "en";

  await db
    .update(person)
    .set({ displayName, accessibilityNeeds, nationality, languagesSpoken, preferredLocale })
    .where(eq(person.id, user.personId));

  await audit({
    actorId: user.personId,
    action: "profile.updated",
    objectType: "person",
    objectId: user.personId,
  });
  revalidatePath("/account/profile");
}

/**
 * Initiate account closure (PRD IAM-008). Records the request and marks the
 * profile for review; actual erasure follows the retention workflow (§18.3)
 * so operational/legal obligations are respected before deletion.
 */
export async function requestAccountClosure() {
  const user = await requireUser();
  await db
    .update(person)
    .set({ deletedAt: new Date() })
    .where(eq(person.id, user.personId));
  await audit({
    actorId: user.personId,
    action: "account.closure_requested",
    objectType: "person",
    objectId: user.personId,
  });
  revalidatePath("/account/privacy");
}
