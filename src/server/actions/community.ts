"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  group,
  groupMembership,
  post,
  reply,
  contentReport,
} from "@/db/schema";
import { requireUser, requirePermission } from "@/lib/auth/session";
import { getFlag, FLAGS } from "@/lib/flags";
import { audit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { enforceRateLimit } from "@/lib/rate-limit";

/** Join a moderated group (PRD COM-001). */
export async function joinGroup(groupId: string, formData: FormData) {
  const user = await requireUser();
  const alias = String(formData.get("displayAlias") ?? "").slice(0, 60) || null;
  await db
    .insert(groupMembership)
    .values({ groupId, personId: user.personId, displayAlias: alias })
    .onConflictDoNothing();
  revalidatePath("/community");
}

/**
 * Create a post. New posts are held pending when the group pre-moderates
 * (PRD COM-005). Composer PII warnings are surfaced client-side.
 */
export async function createPost(groupId: string, formData: FormData) {
  const enabled = await getFlag(FLAGS.COMMUNITY);
  if (!enabled) return;
  const user = await requireUser();
  await enforceRateLimit("community", user.personId);
  const body = z.string().min(1).max(5000).safeParse(formData.get("body"));
  if (!body.success) return;

  const [g] = await db.select().from(group).where(eq(group.id, groupId)).limit(1);
  if (!g) return;

  // Posting requires membership of that specific group. Without this check any
  // signed-in account could post into a group it had never joined, bypassing
  // the join step where group rules are shown and an alias is chosen.
  const [membership] = await db
    .select({ id: groupMembership.id })
    .from(groupMembership)
    .where(
      and(
        eq(groupMembership.groupId, groupId),
        eq(groupMembership.personId, user.personId),
      ),
    )
    .limit(1);
  if (!membership) return;

  const [row] = await db
    .insert(post)
    .values({
      groupId,
      authorId: user.personId,
      body: body.data,
      status: g.preModerate ? "pending" : "published",
    })
    .returning({ id: post.id });

  await audit({
    actorId: user.personId,
    action: "post.created",
    objectType: "post",
    objectId: row.id,
    context: { moderated: g.preModerate },
  });
  revalidatePath(`/community/${g.slug}`);
}

export async function createReply(postId: string, formData: FormData) {
  const enabled = await getFlag(FLAGS.COMMUNITY);
  if (!enabled) return;
  const user = await requireUser();
  await enforceRateLimit("community", user.personId);
  const body = z.string().min(1).max(3000).safeParse(formData.get("body"));
  if (!body.success) return;

  // Resolve the parent post so we can confirm it exists, is visible, and that
  // the replier belongs to the group it lives in.
  const [parent] = await db
    .select({ groupId: post.groupId, status: post.status })
    .from(post)
    .where(eq(post.id, postId))
    .limit(1);
  if (!parent || parent.status !== "published") return;

  const [membership] = await db
    .select({ id: groupMembership.id })
    .from(groupMembership)
    .where(
      and(
        eq(groupMembership.groupId, parent.groupId),
        eq(groupMembership.personId, user.personId),
      ),
    )
    .limit(1);
  if (!membership) return;

  await db.insert(reply).values({
    postId,
    authorId: user.personId,
    body: body.data,
    status: "published",
  });
  revalidatePath("/community");
}

/** Report content for moderation (PRD COM-003/006). */
export async function reportContent(
  targetType: "post" | "reply",
  targetId: string,
  formData: FormData,
) {
  const user = await requireUser();
  await enforceRateLimit("community", user.personId);
  const category = String(formData.get("reason") ?? "Inappropriate").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  // Keep the reporter's own words — moderators need them to triage safely.
  const reason = (detail ? `${category} — ${detail}` : category).slice(0, 500);
  await db.insert(contentReport).values({
    reporterId: user.personId,
    targetType,
    targetId,
    reason,
    status: "queued",
  });
  await audit({
    actorId: user.personId,
    action: "content.reported",
    objectType: targetType,
    objectId: targetId,
  });
  revalidatePath("/community");
}

/* ------------------------------------------------------------- moderation */

export async function moderateReport(
  reportId: string,
  decision: "remove" | "dismiss" | "warning",
): Promise<void> {
  // Must be a trained moderator - `content:read` is held by every member and
  // would have allowed any signed-in user to remove content.
  const staff = await requirePermission("moderation:handle");
  const [r] = await db
    .select()
    .from(contentReport)
    .where(eq(contentReport.id, reportId))
    .limit(1);
  if (!r) return;

  if (decision === "remove") {
    if (r.targetType === "post") {
      await db.update(post).set({ status: "removed" }).where(eq(post.id, r.targetId));
    } else {
      await db.update(reply).set({ status: "removed" }).where(eq(reply.id, r.targetId));
    }
  }

  await db
    .update(contentReport)
    .set({ status: decision === "dismiss" ? "dismissed" : "actioned", action: decision, reviewedById: staff.personId })
    .where(eq(contentReport.id, reportId));

  await audit({
    actorId: staff.personId,
    actorRole: "moderator",
    action: `moderation.${decision}`,
    objectType: "content_report",
    objectId: reportId,
  });
  revalidatePath("/admin/community");
}

/** Approve a pending post (PRD COM-005). */
export async function approvePost(postId: string): Promise<void> {
  const staff = await requirePermission("moderation:handle");
  await db.update(post).set({ status: "published" }).where(eq(post.id, postId));
  await audit({ actorId: staff.personId, actorRole: "moderator", action: "post.approved", objectType: "post", objectId: postId });
  revalidatePath("/admin/community");
}

/* ------------------------------------------------------------ admin: group */

export async function saveGroup(formData: FormData) {
  const staff = await requirePermission("user:manage");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(group).values({
    name,
    slug: (String(formData.get("slug") ?? "").trim() || slugify(name)),
    purpose: String(formData.get("purpose") ?? "") || null,
    rules: String(formData.get("rules") ?? "") || null,
    preModerate: formData.get("preModerate") === "on",
    active: formData.get("active") === "on",
  });
  await audit({ actorId: staff.personId, action: "group.created", objectType: "group", objectId: null });
  revalidatePath("/admin/community");
  revalidatePath("/community");
}
