"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { donation, shopOrder } from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/payments/provider";
import { audit } from "@/lib/audit";

/**
 * Refund a donation (PRD FUND-009). Requires refund:approve. In a fuller
 * build the requester and approver must differ above a threshold; that
 * separation is enforced at the workflow layer.
 */
export async function refundDonation(donationId: string): Promise<void> {
  const staff = await requirePermission("refund:approve");
  const rows = await db.select().from(donation).where(eq(donation.id, donationId)).limit(1);
  const d = rows[0];
  if (!d || d.status !== "completed") return;

  if (d.providerReference && !d.providerReference.startsWith("test_")) {
    await getPaymentProvider().refund(d.providerReference, d.amountCents);
  }
  await db.update(donation).set({ status: "refunded" }).where(eq(donation.id, donationId));
  await audit({
    actorId: staff.personId,
    actorRole: "finance",
    action: "donation.refunded",
    objectType: "donation",
    objectId: donationId,
    context: { amountCents: d.amountCents },
  });
  revalidatePath("/admin/finance");
}

export async function setOrderStatus(orderId: string, status: string): Promise<void> {
  const staff = await requirePermission("donation:manage");
  await db
    .update(shopOrder)
    .set({ status: status as never })
    .where(eq(shopOrder.id, orderId));
  await audit({
    actorId: staff.personId,
    action: "order.status_changed",
    objectType: "shop_order",
    objectId: orderId,
    context: { status },
  });
  revalidatePath("/admin/finance");
}
