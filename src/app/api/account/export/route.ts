import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  person,
  consentReceipt,
  communicationPreference,
  enrollment,
  courseApplication,
  eventRegistration,
  certificate,
  timeEntry,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

/**
 * Portable export of the signed-in user's own data (PRD IAM-012). Excludes
 * other people's data and internal protected notes (§18.3).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const pid = user.personId;

  const [profile, consents, prefs, enrollments, applications, events, certs, hours] =
    await Promise.all([
      db.select().from(person).where(eq(person.id, pid)),
      db.select().from(consentReceipt).where(eq(consentReceipt.personId, pid)),
      db.select().from(communicationPreference).where(eq(communicationPreference.personId, pid)),
      db.select().from(enrollment).where(eq(enrollment.personId, pid)),
      db.select().from(courseApplication).where(eq(courseApplication.personId, pid)),
      db.select().from(eventRegistration).where(eq(eventRegistration.personId, pid)),
      db.select().from(certificate).where(eq(certificate.personId, pid)),
      db.select().from(timeEntry).where(eq(timeEntry.personId, pid)),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, name: user.name },
    profile: profile[0] ?? null,
    consents,
    communicationPreferences: prefs,
    enrollments,
    applications,
    eventRegistrations: events,
    certificates: certs,
    volunteerHours: hours,
  };

  await audit({
    actorId: pid,
    action: "data.exported",
    objectType: "person",
    objectId: pid,
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="24asia-my-data.json"`,
      // This response is a full copy of one person's record: never let a proxy,
      // CDN or the browser cache retain it.
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
