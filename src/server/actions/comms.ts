"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  subscriber,
  newsletterCampaign,
  notification,
  communicationPreference,
  pushSubscription,
  person,
} from "@/db/schema";
import { requireUser, requirePermission } from "@/lib/auth/session";
import { sendPushToPerson } from "@/lib/notify/notifications";
import { audit } from "@/lib/audit";
import { isProd } from "@/env";

/* ----------------------------------------------------- public subscribe */

export async function subscribeNewsletter(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { ok: false, error: "Enter a valid email." };
  await db
    .insert(subscriber)
    .values({ email: email.data, confirmed: true })
    .onConflictDoNothing();
  return { ok: true };
}

/* --------------------------------------------------- push subscriptions */

export async function savePushSubscription(sub: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const user = await requireUser();
  await db
    .insert(pushSubscription)
    .values({ personId: user.personId, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth })
    .onConflictDoNothing();
  return { ok: true };
}

export async function removePushSubscription(endpoint: string) {
  await db.delete(pushSubscription).where(eq(pushSubscription.endpoint, endpoint));
}

/* -------------------------------------------------------- in-app center */

export async function markNotificationRead(id: string) {
  const user = await requireUser();
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.id, id), eq(notification.personId, user.personId)));
  revalidatePath("/account/notifications");
}

export async function markAllRead() {
  const user = await requireUser();
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.personId, user.personId), isNull(notification.readAt)));
  revalidatePath("/account/notifications");
}

/* ------------------------------------------------------- admin campaigns */

export async function saveCampaign(formData: FormData) {
  const staff = await requirePermission("content:publish");
  const title = String(formData.get("title") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !subject || !body) return;
  await db.insert(newsletterCampaign).values({
    title,
    subject,
    body,
    topic: String(formData.get("topic") ?? "marketing"),
    channel: String(formData.get("channel") ?? "in_app"),
    status: "draft",
    createdById: staff.personId,
  });
  await audit({ actorId: staff.personId, action: "campaign.created", objectType: "newsletter_campaign", objectId: null });
  revalidatePath("/admin/comms");
}

/**
 * Sends a campaign to consenting members (PRD MSG-002/006). Builds the audience
 * from communication preferences; excludes people who have not opted in for the
 * topic. Delivers as in-app notifications + web push; email is logged in dev.
 */
export async function sendCampaign(campaignId: string) {
  const staff = await requirePermission("content:publish");
  const [c] = await db
    .select()
    .from(newsletterCampaign)
    .where(eq(newsletterCampaign.id, campaignId))
    .limit(1);
  if (!c || c.status === "sent") return;

  // Audience: members who opted in for this topic (service messages always allowed).
  const prefs = await db
    .select({ personId: communicationPreference.personId })
    .from(communicationPreference)
    .where(
      and(
        eq(communicationPreference.topic, c.topic as never),
        eq(communicationPreference.channelInApp, true),
      ),
    );
  let audience = prefs.map((p) => p.personId);
  // Fallback: if nobody set explicit prefs, service/announcement topics reach all.
  if (audience.length === 0 && (c.topic === "service" || c.topic === "safety")) {
    const all = await db.select({ id: person.id }).from(person);
    audience = all.map((a) => a.id);
  }

  for (const personId of audience) {
    await db.insert(notification).values({
      personId,
      channel: "in_app",
      templateKey: `campaign:${c.id}`,
      title: c.subject,
      body: c.body.slice(0, 280),
      deliveredAt: new Date(),
    });
    void sendPushToPerson(personId, c.subject, c.body.slice(0, 120));
  }

  await db
    .update(newsletterCampaign)
    .set({ status: "sent", sentAt: new Date(), recipientCount: audience.length })
    .where(eq(newsletterCampaign.id, campaignId));

  if (!isProd) {
    console.info(`[campaign] "${c.subject}" delivered to ${audience.length} recipients`);
  }

  await audit({
    actorId: staff.personId,
    action: "campaign.sent",
    objectType: "newsletter_campaign",
    objectId: campaignId,
    context: { recipients: audience.length },
  });
  revalidatePath("/admin/comms");
}
