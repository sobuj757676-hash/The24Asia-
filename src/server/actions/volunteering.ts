"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  timeEntry,
  volunteerProfile,
  shiftAssignment,
  incident,
  event,
} from "@/db/schema";
import { requireUser, requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notify/notifications";

/** Log volunteer hours; goes to supervisor approval (PRD VOL-010). */
export async function logHours(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = z
    .object({
      hours: z.coerce.number().positive().max(24),
      activityDate: z.string().min(1),
      note: z.string().max(1000).optional(),
    })
    .safeParse({
      hours: formData.get("hours"),
      activityDate: formData.get("activityDate"),
      note: formData.get("note") || undefined,
    });
  if (!parsed.success) return;

  const [row] = await db
    .insert(timeEntry)
    .values({
      personId: user.personId,
      hours: String(parsed.data.hours),
      activityDate: new Date(parsed.data.activityDate),
      note: parsed.data.note,
      approved: false,
    })
    .returning({ id: timeEntry.id });

  await audit({
    actorId: user.personId,
    action: "time_entry.submitted",
    objectType: "time_entry",
    objectId: row.id,
  });
}

/** Supervisor approves logged hours and rolls them into the profile total (VOL-010). */
export async function decideHours(id: string, decision: "approve" | "reject") {
  const staff = await requirePermission("volunteer:hours_approve");
  const [entry] = await db.select().from(timeEntry).where(eq(timeEntry.id, id)).limit(1);
  if (!entry || entry.approved) return;

  if (decision === "approve") {
    await db
      .update(timeEntry)
      .set({ approved: true, approvedById: staff.personId, approvedAt: new Date() })
      .where(eq(timeEntry.id, id));
    await db
      .update(volunteerProfile)
      .set({ totalHours: sql`${volunteerProfile.totalHours} + ${entry.hours}` })
      .where(eq(volunteerProfile.personId, entry.personId));
    await notify({
      personId: entry.personId,
      templateKey: "hours.approved",
      title: "Your volunteer hours were approved",
      body: `${entry.hours} hours`,
      linkUrl: "/volunteer-portal/hours",
    });
  } else {
    await db.delete(timeEntry).where(eq(timeEntry.id, id));
  }

  await audit({
    actorId: staff.personId,
    actorRole: "coordinator",
    action: `time_entry.${decision}`,
    objectType: "time_entry",
    objectId: id,
  });
  revalidatePath("/admin/volunteers/hours");
}

/** Volunteer acknowledges the current handbook / code of conduct (VOL-005). */
export async function acknowledgeHandbook() {
  const user = await requireUser();
  await db
    .update(volunteerProfile)
    .set({ handbookAcknowledgedAt: new Date() })
    .where(eq(volunteerProfile.personId, user.personId));
  await audit({
    actorId: user.personId,
    action: "handbook.acknowledged",
    objectType: "volunteer_profile",
    objectId: user.personId,
  });
  revalidatePath("/volunteer-portal/profile");
}

/** Volunteer updates their skills / availability / languages (VOL-011). */
export async function updateVolunteerProfile(formData: FormData) {
  const user = await requireUser();
  const skills = String(formData.get("skills") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const languages = String(formData.get("languages") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const availability = String(formData.get("availability") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  await db
    .update(volunteerProfile)
    .set({ skills, languages, availability })
    .where(eq(volunteerProfile.personId, user.personId));
  revalidatePath("/volunteer-portal/profile");
}

/** Self-service shift sign-up for an upcoming event (VOL-009). */
export async function signUpForShift(eventId: string, formData: FormData) {
  const user = await requireUser();
  const role = String(formData.get("role") ?? "General crew").slice(0, 120);

  const [ev] = await db.select().from(event).where(eq(event.id, eventId)).limit(1);
  if (!ev) return;

  const existing = await db
    .select({ id: shiftAssignment.id })
    .from(shiftAssignment)
    .where(and(eq(shiftAssignment.personId, user.personId), eq(shiftAssignment.eventId, eventId)))
    .limit(1);
  if (existing[0]) return;

  await db.insert(shiftAssignment).values({
    personId: user.personId,
    eventId,
    role,
    startsAt: ev.startsAt,
    endsAt: ev.endsAt,
    status: "accepted",
  });
  await audit({
    actorId: user.personId,
    action: "shift.signed_up",
    objectType: "event",
    objectId: eventId,
  });
  revalidatePath("/volunteer-portal/shifts");
}

export async function cancelShift(shiftId: string) {
  const user = await requireUser();
  await db
    .update(shiftAssignment)
    .set({ status: "cancelled" })
    .where(and(eq(shiftAssignment.id, shiftId), eq(shiftAssignment.personId, user.personId)));
  revalidatePath("/volunteer-portal/shifts");
}

/** Volunteer safety / incident report (PRD 7.3, OPS-009). Restricted handling. */
export async function reportIncident(formData: FormData) {
  const user = await requireUser();
  const summary = String(formData.get("summary") ?? "").trim();
  if (!summary) return;
  await db.insert(incident).values({
    type: String(formData.get("type") ?? "safety"),
    severity: (String(formData.get("severity") ?? "medium") as never),
    summary,
    status: "reported",
    reportedById: user.personId,
  });
  await audit({
    actorId: user.personId,
    action: "incident.reported",
    objectType: "incident",
    objectId: null,
  });
  revalidatePath("/volunteer-portal/report");
}
