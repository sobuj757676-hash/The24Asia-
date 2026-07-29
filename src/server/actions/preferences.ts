"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { person, communicationPreference, consentReceipt } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { routing } from "@/i18n/routing";

export async function updateLocale(formData: FormData): Promise<void> {
  const user = await requireUser();
  const locale = String(formData.get("locale") ?? "en");
  const valid = (routing.locales as readonly string[]).includes(locale)
    ? (locale as (typeof routing.locales)[number])
    : "en";
  await db
    .update(person)
    .set({ preferredLocale: valid })
    .where(eq(person.id, user.personId));
}

const TOPICS = [
  "service",
  "learning",
  "events",
  "volunteering",
  "fundraising",
  "marketing",
] as const;

/** Save granular channel/topic preferences (PRD IAM-006, MSG-003). */
export async function updatePreferences(formData: FormData): Promise<void> {
  const user = await requireUser();

  for (const topic of TOPICS) {
    const email = formData.get(`${topic}.email`) === "on";
    const sms = formData.get(`${topic}.sms`) === "on";
    const inApp = formData.get(`${topic}.inApp`) === "on";

    await db
      .insert(communicationPreference)
      .values({
        personId: user.personId,
        topic,
        channelEmail: email,
        channelSms: sms,
        channelInApp: inApp,
      })
      .onConflictDoUpdate({
        target: [communicationPreference.personId, communicationPreference.topic],
        set: { channelEmail: email, channelSms: sms, channelInApp: inApp },
      });
  }

  // Record a consent receipt for the marketing choice specifically.
  const marketing = formData.get("marketing.email") === "on";
  await db.insert(consentReceipt).values({
    personId: user.personId,
    purpose: "marketing",
    granted: marketing,
    noticeVersion: "2026-07",
    channel: "web",
  });

  await audit({
    actorId: user.personId,
    action: "preferences.updated",
    objectType: "person",
    objectId: user.personId,
  });
}
