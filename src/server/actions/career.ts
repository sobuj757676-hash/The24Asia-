"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  opportunityListing,
  listingApplication,
  careerGoal,
  mentorMatch,
  mentorProfile,
} from "@/db/schema";
import { requireUser, requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

function s(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function b(fd: FormData, k: string) {
  return fd.get(k) === "on";
}

/* --------------------------------------------- admin: opportunity listings */

export async function saveListing(fd: FormData) {
  const staff = await requirePermission("content:publish");
  const id = s(fd, "id");
  const title = s(fd, "title");
  if (!title) return;
  const values = {
    title,
    description: s(fd, "description"),
    roleType: s(fd, "roleType"),
    compensation: s(fd, "compensation"),
    eligibility: s(fd, "eligibility"),
    accountableContact: s(fd, "accountableContact"),
    verified: b(fd, "verified"),
    published: b(fd, "published"),
  };
  if (id) await db.update(opportunityListing).set(values).where(eq(opportunityListing.id, id));
  else await db.insert(opportunityListing).values(values);
  await audit({ actorId: staff.personId, action: id ? "listing.updated" : "listing.created", objectType: "opportunity_listing", objectId: id });
  revalidatePath("/admin/career");
  revalidatePath("/careers");
}

export async function deleteListing(id: string) {
  const staff = await requirePermission("content:publish");
  await db.delete(opportunityListing).where(eq(opportunityListing.id, id));
  await audit({ actorId: staff.personId, action: "listing.deleted", objectType: "opportunity_listing", objectId: id });
  revalidatePath("/admin/career");
}

/** Apply to a verified listing (PRD CAR-007: explicit consent to share). */
export async function applyToListing(listingId: string, formData: FormData) {
  const user = await requireUser();
  const consent = formData.get("consentToShare") === "on";
  await db.insert(listingApplication).values({
    listingId,
    personId: user.personId,
    milestone: "applied",
    consentToShare: consent,
  });
  await audit({
    actorId: user.personId,
    action: "listing_application.created",
    objectType: "opportunity_listing",
    objectId: listingId,
    context: { consent },
  });
  redirect("/account?applied=1");
}

/* --------------------------------------------------------- career goals */

export async function addGoal(formData: FormData) {
  const user = await requireUser();
  const title = s(formData, "title");
  if (!title) return;
  await db.insert(careerGoal).values({
    personId: user.personId,
    title,
    detail: s(formData, "detail"),
    status: "active",
  });
  revalidatePath("/account/career");
}

/* ------------------------------------------------------------ mentorship */

/** Learner requests mentorship (PRD CAR-003). */
export async function requestMentorship(formData: FormData) {
  const user = await requireUser();
  await db.insert(mentorMatch).values({
    menteeId: user.personId,
    status: "requested",
    topic: s(formData, "topic"),
  });
  await audit({
    actorId: user.personId,
    action: "mentor_match.requested",
    objectType: "mentor_match",
    objectId: null,
  });
  revalidatePath("/account/career");
}

/** Coordinator matches a mentor to a request. */
export async function assignMentor(matchId: string, mentorPersonId: string) {
  const staff = await requirePermission("person:read_scoped");
  await db
    .update(mentorMatch)
    .set({ mentorId: mentorPersonId, status: "matched" })
    .where(eq(mentorMatch.id, matchId));
  await audit({
    actorId: staff.personId,
    action: "mentor_match.matched",
    objectType: "mentor_match",
    objectId: matchId,
  });
  revalidatePath("/admin/support");
}

/** Become a mentor (volunteer path). */
export async function registerMentor(formData: FormData) {
  const user = await requireUser();
  const existing = await db
    .select({ id: mentorProfile.id })
    .from(mentorProfile)
    .where(eq(mentorProfile.personId, user.personId))
    .limit(1);
  if (existing[0]) return;
  await db.insert(mentorProfile).values({
    personId: user.personId,
    bio: s(formData, "bio"),
    expertise: (s(formData, "expertise") || "").split(",").map((x) => x.trim()).filter(Boolean),
  });
  revalidatePath("/account/career");
}
