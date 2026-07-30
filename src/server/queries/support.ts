import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  supportRequest,
  opportunityListing,
  careerGoal,
  mentorMatch,
  mentorProfile,
  person,
} from "@/db/schema";

/** Safety cap so no list query can return an unbounded result set. */
const LIST_LIMIT = 500;

export async function mySupportRequests(personId: string) {
  return db
    .select()
    .from(supportRequest)
    .where(eq(supportRequest.personId, personId))
    .orderBy(desc(supportRequest.createdAt))
    .limit(LIST_LIMIT);
}

export async function listPublishedListings() {
  return db
    .select()
    .from(opportunityListing)
    .where(eq(opportunityListing.published, true))
    .orderBy(desc(opportunityListing.createdAt))
    .limit(LIST_LIMIT);
}

export async function listAllListings() {
  return db
    .select()
    .from(opportunityListing)
    .orderBy(desc(opportunityListing.createdAt))
    .limit(LIST_LIMIT);
}

export async function myGoals(personId: string) {
  return db
    .select()
    .from(careerGoal)
    .where(eq(careerGoal.personId, personId))
    .orderBy(desc(careerGoal.createdAt))
    .limit(LIST_LIMIT);
}

export async function myMatches(personId: string) {
  return db
    .select()
    .from(mentorMatch)
    .where(eq(mentorMatch.menteeId, personId))
    .orderBy(desc(mentorMatch.createdAt))
    .limit(LIST_LIMIT);
}

export async function isMentor(personId: string) {
  const rows = await db
    .select({ id: mentorProfile.id })
    .from(mentorProfile)
    .where(eq(mentorProfile.personId, personId))
    .limit(1);
  return !!rows[0];
}

/* admin */
export async function listSupportQueue() {
  return db
    .select({ req: supportRequest, personName: person.displayName })
    .from(supportRequest)
    .leftJoin(person, eq(supportRequest.personId, person.id))
    .orderBy(desc(supportRequest.createdAt))
    .limit(200);
}

export async function listMentorRequests() {
  return db
    .select({ match: mentorMatch, menteeName: person.displayName })
    .from(mentorMatch)
    .leftJoin(person, eq(mentorMatch.menteeId, person.id))
    .orderBy(desc(mentorMatch.createdAt))
    .limit(200);
}
