import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { person } from "@/db/schema";

/**
 * Ensures an app `person` record exists for an authenticated auth user.
 * Called from portal/account layouts so a profile is created lazily on first
 * authenticated visit (better-auth only manages the `user` table).
 */
export async function ensurePerson(userId: string, name?: string) {
  const existing = await db
    .select({ id: person.id })
    .from(person)
    .where(eq(person.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const [row] = await db
    .insert(person)
    .values({ userId, displayName: name ?? null })
    .returning({ id: person.id });
  return row.id;
}
