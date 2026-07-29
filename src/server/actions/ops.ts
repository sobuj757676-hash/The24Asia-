"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  meeting,
  risk,
  incident,
  asset,
  productVariant,
  stockMovement,
  expenseClaim,
  partnerContact,
  opportunityListing,
} from "@/db/schema";
import { requireUser, requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

function s(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function num(fd: FormData, k: string) {
  const v = s(fd, k);
  return v ? Number(v) : undefined;
}
function d(fd: FormData, k: string) {
  const v = s(fd, k);
  return v ? new Date(v) : undefined;
}

/* ------------------------------------------------------------ governance */

export async function saveMeeting(fd: FormData) {
  const staff = await requirePermission("audit:read");
  const title = s(fd, "title");
  if (!title) return;
  await db.insert(meeting).values({
    title,
    heldAt: d(fd, "heldAt"),
    minutes: s(fd, "minutes"),
    decisions: s(fd, "decisions"),
  });
  await audit({ actorId: staff.personId, action: "meeting.created", objectType: "meeting", objectId: null });
  revalidatePath("/admin/governance");
}

export async function saveRisk(fd: FormData) {
  const staff = await requirePermission("audit:read");
  const description = s(fd, "description");
  if (!description) return;
  await db.insert(risk).values({
    category: s(fd, "category") ?? "operational",
    description,
    likelihood: (s(fd, "likelihood") as never) ?? ("low" as never),
    impact: (s(fd, "impact") as never) ?? ("low" as never),
    controls: s(fd, "controls"),
    status: s(fd, "status") ?? "open",
    reviewDate: d(fd, "reviewDate"),
  });
  await audit({ actorId: staff.personId, action: "risk.created", objectType: "risk", objectId: null });
  revalidatePath("/admin/governance");
}

export async function saveIncident(fd: FormData) {
  const staff = await requirePermission("audit:read");
  const summary = s(fd, "summary");
  if (!summary) return;
  await db.insert(incident).values({
    type: s(fd, "type") ?? "operational",
    severity: (s(fd, "severity") as never) ?? ("low" as never),
    summary,
    status: "reported",
    reportedById: staff.personId,
  });
  await audit({ actorId: staff.personId, action: "incident.created", objectType: "incident", objectId: null });
  revalidatePath("/admin/governance");
}

/* ---------------------------------------------------------- assets/stock */

export async function saveAsset(fd: FormData) {
  const staff = await requirePermission("event:manage");
  const name = s(fd, "name");
  const identifier = s(fd, "identifier");
  if (!name || !identifier) return;
  await db.insert(asset).values({
    name,
    identifier,
    category: s(fd, "category") ?? "equipment",
    location: s(fd, "location"),
    condition: s(fd, "condition") ?? "good",
    valueBand: s(fd, "valueBand"),
  });
  await audit({ actorId: staff.personId, action: "asset.created", objectType: "asset", objectId: null });
  revalidatePath("/admin/assets");
}

export async function adjustStock(fd: FormData) {
  const staff = await requirePermission("event:manage");
  const variantId = s(fd, "variantId");
  const delta = num(fd, "delta");
  if (!variantId || delta === undefined) return;
  await db
    .update(productVariant)
    .set({ stock: sql`greatest(0, ${productVariant.stock} + ${delta})` })
    .where(eq(productVariant.id, variantId));
  await db.insert(stockMovement).values({
    variantId,
    delta,
    reason: s(fd, "reason") ?? "adjustment",
    actorId: staff.personId,
  });
  await audit({ actorId: staff.personId, action: "stock.adjusted", objectType: "product_variant", objectId: variantId, context: { delta } });
  revalidatePath("/admin/assets");
}

/* -------------------------------------------------------------- expenses */

export async function submitExpense(fd: FormData) {
  const user = await requireUser();
  const amount = num(fd, "amount");
  if (amount === undefined) return;
  await db.insert(expenseClaim).values({
    personId: user.personId,
    amountCents: Math.round(amount * 100),
    category: s(fd, "category"),
    description: s(fd, "description"),
    status: "submitted",
  });
  await audit({ actorId: user.personId, action: "expense.submitted", objectType: "expense_claim", objectId: null });
  revalidatePath("/volunteer-portal/expenses");
}

export async function decideExpense(id: string, decision: "approved" | "rejected" | "paid") {
  const staff = await requirePermission("volunteer:hours_approve");
  await db.update(expenseClaim).set({ status: decision, approvedById: staff.personId }).where(eq(expenseClaim.id, id));
  await audit({ actorId: staff.personId, action: `expense.${decision}`, objectType: "expense_claim", objectId: id });
  revalidatePath("/admin/volunteers/expenses");
}

/* --------------------------------------------------------- partner portal */

export async function linkPartnerContact(fd: FormData) {
  const staff = await requirePermission("user:manage");
  const partnerId = s(fd, "partnerId");
  const email = s(fd, "email");
  if (!partnerId || !email) return;

  // Resolve the person by their auth email; they must have signed in once.
  const { user, person } = await import("@/db/schema");
  const rows = await db
    .select({ personId: person.id })
    .from(person)
    .innerJoin(user, eq(person.userId, user.id))
    .where(eq(user.email, email))
    .limit(1);
  const personId = rows[0]?.personId;
  if (!personId) return;

  await db
    .insert(partnerContact)
    .values({ partnerId, personId, title: s(fd, "title"), isPrimary: fd.get("isPrimary") === "on" })
    .onConflictDoNothing();
  await audit({ actorId: staff.personId, action: "partner_contact.linked", objectType: "partner", objectId: partnerId });
  revalidatePath("/admin/content/partners");
}

/** Partner contact submits an opportunity listing (unpublished, pending review). */
export async function submitPartnerListing(partnerId: string, fd: FormData) {
  const user = await requireUser();
  const title = s(fd, "title");
  if (!title) return;
  await db.insert(opportunityListing).values({
    partnerId,
    title,
    description: s(fd, "description"),
    roleType: s(fd, "roleType"),
    compensation: s(fd, "compensation"),
    eligibility: s(fd, "eligibility"),
    accountableContact: s(fd, "accountableContact"),
    verified: false,
    published: false,
  });
  await audit({ actorId: user.personId, action: "listing.submitted", objectType: "opportunity_listing", objectId: null, context: { partnerId } });
  revalidatePath("/partner-portal");
}
