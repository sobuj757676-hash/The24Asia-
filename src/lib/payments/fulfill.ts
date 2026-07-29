import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { donation, campaign, shopOrder, orderLine, productVariant } from "@/db/schema";
import { audit } from "@/lib/audit";

/**
 * Marks a donation paid and updates campaign progress. Idempotent - a repeated
 * webhook/confirm will not double count (guarded by current status).
 */
export async function fulfillDonation(donationId: string, providerRef?: string) {
  const rows = await db.select().from(donation).where(eq(donation.id, donationId)).limit(1);
  const d = rows[0];
  if (!d || d.status === "completed") return;

  await db
    .update(donation)
    .set({ status: "completed", providerReference: providerRef ?? d.providerReference })
    .where(eq(donation.id, donationId));

  if (d.campaignId) {
    await db
      .update(campaign)
      .set({ raisedAmountCents: sql`${campaign.raisedAmountCents} + ${d.amountCents}` })
      .where(eq(campaign.id, d.campaignId));
  }

  await audit({
    action: "donation.completed",
    objectType: "donation",
    objectId: donationId,
    context: { amountCents: d.amountCents },
  });
}

/** Marks an order paid, confirms it and decrements stock (PRD MER-002/003). */
export async function fulfillOrder(orderId: string, providerRef?: string) {
  const rows = await db.select().from(shopOrder).where(eq(shopOrder.id, orderId)).limit(1);
  const o = rows[0];
  if (!o || o.status === "confirmed" || o.status === "fulfilled") return;

  await db
    .update(shopOrder)
    .set({ status: "confirmed", paidAt: new Date(), providerReference: providerRef ?? o.providerReference })
    .where(eq(shopOrder.id, orderId));

  const lines = await db.select().from(orderLine).where(eq(orderLine.orderId, orderId));
  for (const line of lines) {
    await db
      .update(productVariant)
      .set({ stock: sql`greatest(0, ${productVariant.stock} - ${line.quantity})` })
      .where(eq(productVariant.id, line.variantId));
  }

  await audit({
    action: "order.paid",
    objectType: "shop_order",
    objectId: orderId,
    context: { totalCents: o.totalCents },
  });
}
