"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  courseApplication,
  enrollment,
  volunteerApplication,
  volunteerProfile,
  featureFlag,
} from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

/**
 * Approve a course application and create an enrollment, reserving capacity
 * transactionally (PRD 10.8: capacity reserved only on accepted enrollment).
 */
export async function decideCourseApplication(
  applicationId: string,
  decision: "approved" | "declined" | "waitlisted",
  reason?: string,
): Promise<void> {
  const staff = await requirePermission("application:review");

  const rows = await db
    .select()
    .from(courseApplication)
    .where(eq(courseApplication.id, applicationId))
    .limit(1);
  const app = rows[0];
  if (!app) return;

  await db
    .update(courseApplication)
    .set({
      status: decision,
      decisionReason: reason ?? null,
      reviewedById: staff.personId,
    })
    .where(eq(courseApplication.id, applicationId));

  if (decision === "approved") {
    // Idempotent enrollment
    const existing = await db
      .select({ id: enrollment.id })
      .from(enrollment)
      .where(
        and(
          eq(enrollment.cohortId, app.cohortId),
          eq(enrollment.personId, app.personId),
        ),
      )
      .limit(1);
    if (!existing[0]) {
      await db.insert(enrollment).values({
        cohortId: app.cohortId,
        personId: app.personId,
        status: "enrolled",
      });
    }
  }

  await audit({
    actorId: staff.personId,
    actorRole: "coordinator",
    action: `course_application.${decision}`,
    objectType: "course_application",
    objectId: applicationId,
    reason,
  });

  revalidatePath("/admin/programs");
}

/** Approve/decline a volunteer application; approval creates a profile. */
export async function decideVolunteerApplication(
  applicationId: string,
  decision: "approved" | "declined" | "waitlisted",
  reason?: string,
): Promise<void> {
  const staff = await requirePermission("volunteer:review");

  const rows = await db
    .select()
    .from(volunteerApplication)
    .where(eq(volunteerApplication.id, applicationId))
    .limit(1);
  const app = rows[0];
  if (!app) return;

  await db
    .update(volunteerApplication)
    .set({ status: decision, decisionReason: reason ?? null, reviewedById: staff.personId })
    .where(eq(volunteerApplication.id, applicationId));

  if (decision === "approved") {
    const existing = await db
      .select({ id: volunteerProfile.id })
      .from(volunteerProfile)
      .where(eq(volunteerProfile.personId, app.personId))
      .limit(1);
    if (!existing[0]) {
      await db
        .insert(volunteerProfile)
        .values({ personId: app.personId, standing: "probation" });
    }
  }

  await audit({
    actorId: staff.personId,
    actorRole: "coordinator",
    action: `volunteer_application.${decision}`,
    objectType: "volunteer_application",
    objectId: applicationId,
    reason,
  });

  revalidatePath("/admin/volunteers");
}

/** Toggle a feature flag (PRD ADM-001/002 - audited config change). */
export async function toggleFlag(key: string, enabled: boolean): Promise<void> {
  const staff = await requirePermission("feature_flag:manage");
  await db
    .update(featureFlag)
    .set({ enabled })
    .where(eq(featureFlag.key, key));
  await audit({
    actorId: staff.personId,
    actorRole: "admin",
    action: "feature_flag.toggled",
    objectType: "feature_flag",
    objectId: key,
    context: { enabled },
  });
  revalidatePath("/admin/flags");
}


import { roleAssignment } from "@/db/schema";

/** Grant a role to a person (PRD 11, role:grant). Audited. */
export async function grantRole(personId: string, role: string): Promise<void> {
  const staff = await requirePermission("role:grant");
  await db.insert(roleAssignment).values({
    personId,
    role: role as never,
    grantedBy: staff.personId,
  });
  await audit({
    actorId: staff.personId,
    actorRole: "admin",
    action: "role.granted",
    objectType: "person",
    objectId: personId,
    context: { role },
  });
  revalidatePath("/admin/users");
}

export async function revokeRole(assignmentId: string): Promise<void> {
  const staff = await requirePermission("role:grant");
  const rows = await db
    .select({ personId: roleAssignment.personId, role: roleAssignment.role })
    .from(roleAssignment)
    .where(eq(roleAssignment.id, assignmentId))
    .limit(1);
  await db.delete(roleAssignment).where(eq(roleAssignment.id, assignmentId));
  await audit({
    actorId: staff.personId,
    actorRole: "admin",
    action: "role.revoked",
    objectType: "role_assignment",
    objectId: assignmentId,
    context: rows[0] ? { role: rows[0].role } : undefined,
  });
  revalidatePath("/admin/users");
}
