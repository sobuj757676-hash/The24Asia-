import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notification, pushSubscription } from "@/db/schema";
import { env } from "@/env";

type NotifyInput = {
  personId: string;
  templateKey: string;
  title: string;
  body?: string;
  linkUrl?: string;
  channel?: "in_app" | "email" | "sms" | "push";
};

/**
 * Creates an in-app notification and (best effort) sends a web push. Copy must
 * be discreet - no sensitive topic on the lock screen (PRD MSG-004).
 */
export async function notify(input: NotifyInput) {
  await db.insert(notification).values({
    personId: input.personId,
    channel: input.channel ?? "in_app",
    templateKey: input.templateKey,
    title: input.title,
    body: input.body,
    linkUrl: input.linkUrl,
    deliveredAt: new Date(),
  });
  // Fire and forget push.
  void sendPushToPerson(input.personId, input.title, input.body ?? "", input.linkUrl);
}

export async function sendPushToPerson(
  personId: string,
  title: string,
  body: string,
  url?: string,
) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  const subs = await db
    .select()
    .from(pushSubscription)
    .where(eq(pushSubscription.personId, personId));
  if (subs.length === 0) return;

  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const payload = JSON.stringify({ title, body, url: url ?? "/" });

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
      } catch {
        // Stale subscription - remove it.
        await db.delete(pushSubscription).where(eq(pushSubscription.id, s.id));
      }
    }),
  );
}
