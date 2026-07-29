"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attendance, eventRegistration, recognition } from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notify/notifications";

/** Mark/correct a learner's attendance for a session (PRD LMS-005, 10.3). */
export async function markAttendance(
  sessionId: string,
  personId: string,
  status: "present" | "late" | "excused" | "no_show",
) {
  const staff = await requirePermission("attendance:mark");
  const existing = await db
    .select({ id: attendance.id })
    .from(attendance)
    .where(and(eq(attendance.sessionId, sessionId), eq(attendance.personId, personId)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(attendance)
      .set({ status, recordedById: staff.personId, recordedAt: new Date(), correctionReason: "updated via roster" })
      .where(eq(attendance.id, existing[0].id));
  } else {
    await db.insert(attendance).values({
      sessionId,
      personId,
      status,
      recordedById: staff.personId,
      recordedAt: new Date(),
    });
  }

  await audit({
    actorId: staff.personId,
    actorRole: "trainer",
    action: "attendance.marked",
    objectType: "cohort_session",
    objectId: sessionId,
    context: { status },
  });
  revalidatePath(`/admin/programs/cohorts/${sessionId}`);
}

/** Event check-in (PRD EVT-006). */
export async function checkInAttendee(registrationId: string) {
  const staff = await requirePermission("registration:manage");
  await db
    .update(eventRegistration)
    .set({ status: "checked_in", checkedInAt: new Date() })
    .where(eq(eventRegistration.id, registrationId));
  await audit({
    actorId: staff.personId,
    action: "event.checked_in",
    objectType: "event_registration",
    objectId: registrationId,
  });
  revalidatePath("/admin/events");
}

/** Award recognition to a volunteer (PRD VOL-014). */
export async function awardRecognition(formData: FormData) {
  const staff = await requirePermission("volunteer:review");
  const personId = String(formData.get("personId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const kind = String(formData.get("kind") ?? "appreciation");
  if (!personId || !label) return;
  await db.insert(recognition).values({ personId, kind, label });
  await notify({
    personId,
    templateKey: "recognition.awarded",
    title: "You received recognition 🎉",
    body: label,
    linkUrl: "/volunteer-portal/profile",
  });
  await audit({
    actorId: staff.personId,
    action: "recognition.awarded",
    objectType: "person",
    objectId: personId,
    context: { kind },
  });
  revalidatePath("/admin/volunteers");
}
