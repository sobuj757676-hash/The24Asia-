import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  meeting,
  risk,
  incident,
  asset,
  expenseClaim,
  partnerContact,
  partner,
  opportunityListing,
  productVariant,
  product,
  person,
} from "@/db/schema";

export async function listMeetings() {
  return db.select().from(meeting).orderBy(desc(meeting.heldAt)).limit(100);
}
export async function listRisks() {
  return db.select().from(risk).orderBy(desc(risk.createdAt)).limit(100);
}
export async function listIncidents() {
  return db.select().from(incident).orderBy(desc(incident.createdAt)).limit(100);
}
export async function listAssets() {
  return db.select().from(asset).orderBy(desc(asset.createdAt)).limit(200);
}
export async function listVariantsForStock() {
  return db
    .select({ variant: productVariant, productName: product.name })
    .from(productVariant)
    .innerJoin(product, eq(productVariant.productId, product.id))
    .orderBy(product.name)
    .limit(LIST_LIMIT);
}
export async function listAllExpenses() {
  return db
    .select({ claim: expenseClaim, personName: person.displayName })
    .from(expenseClaim)
    .leftJoin(person, eq(expenseClaim.personId, person.id))
    .orderBy(desc(expenseClaim.createdAt))
    .limit(LIST_LIMIT);
}
export async function myExpenses(personId: string) {
  return db
    .select()
    .from(expenseClaim)
    .where(eq(expenseClaim.personId, personId))
    .orderBy(desc(expenseClaim.createdAt))
    .limit(LIST_LIMIT);
}
export async function myPartners(personId: string) {
  return db
    .select({ partner, contact: partnerContact })
    .from(partnerContact)
    .innerJoin(partner, eq(partnerContact.partnerId, partner.id))
    .where(eq(partnerContact.personId, personId));
}
export async function partnerListings(partnerId: string) {
  return db
    .select()
    .from(opportunityListing)
    .where(eq(opportunityListing.partnerId, partnerId))
    .orderBy(desc(opportunityListing.createdAt))
    .limit(LIST_LIMIT);
}


import { partnerAgreement } from "@/db/schema";

/** Safety cap so no list query can return an unbounded result set. */
const LIST_LIMIT = 500;

export async function getPartnerAgreements(partnerId: string) {
  return db
    .select()
    .from(partnerAgreement)
    .where(eq(partnerAgreement.partnerId, partnerId))
    .orderBy(desc(partnerAgreement.createdAt))
    .limit(LIST_LIMIT);
}
