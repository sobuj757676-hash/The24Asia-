"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { supportRequest } from "@/db/schema";
import { getCurrentUser, requirePermission } from "@/lib/auth/session";
import { getFlag, FLAGS } from "@/lib/flags";
import { audit } from "@/lib/audit";

/**
 * Private contact / support request (PRD SUP-004..006). Collects only the
 * minimum needed to route safely; no diagnostic claims. Only available when
 * the SUPPORT_INTAKE flag is on (staffed coverage confirmed by the org).
 */
export async function createSupportRequest(formData: FormData) {
  const enabled = await getFlag(FLAGS.SUPPORT_INTAKE);
  if (!enabled) redirect("/support");

  const parsed = z
    .object({
      topic: z.string().max(120).optional(),
      safeContactChannel: z.enum(["phone", "email", "in_app"]).default("in_app"),
      safeContactTime: z.string().max(120).optional(),
      discreetMessageOnly: z.boolean().optional(),
      severity: z.enum(["routine", "high", "critical"]).default("routine"),
    })
    .safeParse({
      topic: formData.get("topic") || undefined,
      safeContactChannel: formData.get("safeContactChannel") || "in_app",
      safeContactTime: formData.get("safeContactTime") || undefined,
      discreetMessageOnly: formData.get("discreetMessageOnly") === "on",
      severity: formData.get("severity") || "routine",
    });
  if (!parsed.success) redirect("/support/request?error=1");

  const user = await getCurrentUser();
  const [row] = await db
    .insert(supportRequest)
    .values({
      personId: user?.personId || null,
      topic: parsed.data.topic,
      safeContactChannel: parsed.data.safeContactChannel,
      safeContactTime: parsed.data.safeContactTime,
      discreetMessageOnly: parsed.data.discreetMessageOnly ?? false,
      severity: parsed.data.severity,
      status: "received",
    })
    .returning({ id: supportRequest.id });

  // Audit records the event only - never the sensitive narrative (PRD 12.3).
  await audit({
    actorId: user?.personId,
    action: "support_request.created",
    objectType: "support_request",
    objectId: row.id,
    context: { severity: parsed.data.severity },
  });

  redirect("/support/request/received");
}

/** Support coordinator updates a request (PRD SUP-006/008). Restricted. */
export async function updateSupportRequest(
  id: string,
  patch: { status?: string; assignSelf?: boolean; outcome?: string },
): Promise<void> {
  const staff = await requirePermission("support:handle");
  const set: Record<string, unknown> = {};
  if (patch.status) set.status = patch.status;
  if (patch.assignSelf) set.assignedToId = staff.personId;
  if (patch.outcome !== undefined) set.outcome = patch.outcome;
  await db.update(supportRequest).set(set).where(eq(supportRequest.id, id));
  await audit({
    actorId: staff.personId,
    actorRole: "support_coordinator",
    action: "support_request.updated",
    objectType: "support_request",
    objectId: id,
    context: { status: patch.status },
  });
  revalidatePath("/admin/support");
}
