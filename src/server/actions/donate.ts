"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { donation, campaign } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getPaymentProvider, PAYMENTS_MODE } from "@/lib/payments/provider";
import { fulfillDonation, fulfillOrder } from "@/lib/payments/fulfill";
import { audit } from "@/lib/audit";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Starts a one-time donation (PRD FUND-001..003). Creates the record, then
 * hands off to the payment provider (Stripe Checkout or the internal test
 * page). Completion is confirmed by webhook / signed confirm, never by the
 * browser redirect alone.
 */
export async function startDonation(formData: FormData) {
  // Unauthenticated and it creates a row plus a provider checkout, so it is the
  // most attractive target for automated abuse on the whole site.
  await enforceRateLimit("donate");

  const parsed = z
    .object({
      amount: z.coerce.number().min(1).max(100000),
      campaignId: z.string().optional(),
      anonymous: z.boolean().optional(),
    })
    .safeParse({
      amount: formData.get("amount"),
      campaignId: formData.get("campaignId") || undefined,
      anonymous: formData.get("anonymous") === "on",
    });
  if (!parsed.success) redirect("/donate?error=invalid");

  const user = await getCurrentUser();
  const amountCents = Math.round(parsed.data.amount * 100);

  const [row] = await db
    .insert(donation)
    .values({
      campaignId: parsed.data.campaignId ?? null,
      personId: user?.personId || null,
      amountCents,
      currency: "SGD",
      status: "pending",
      anonymous: parsed.data.anonymous ?? false,
    })
    .returning({ id: donation.id });

  await audit({
    actorId: user?.personId,
    action: "donation.started",
    objectType: "donation",
    objectId: row.id,
    context: { amountCents },
  });

  const provider = getPaymentProvider();
  const checkout = await provider.createCheckout({
    kind: "donation",
    referenceId: row.id,
    amountCents,
    currency: "SGD",
    description: "Donation to 24Asia",
    successPath: `/donate/thank-you?id=${row.id}`,
    cancelPath: `/donate?cancelled=1`,
  });

  if (checkout.providerReference) {
    await db
      .update(donation)
      .set({ providerReference: checkout.providerReference })
      .where(eq(donation.id, row.id));
  }

  redirect(checkout.url);
}

/**
 * TEST-mode confirmation (no live processor). Simulates the signed webhook so
 * the whole flow is exercised end to end. In production Stripe's webhook does
 * this instead.
 */
export async function confirmTestPayment(kind: "donation" | "order", refId: string) {
  // SECURITY: this simulates a provider callback and must never be reachable
  // once a real payment processor is configured, otherwise anyone could mark an
  // arbitrary donation/order as paid without paying.
  if (PAYMENTS_MODE !== "test") {
    throw new Error("Test payment confirmation is disabled in live payment mode.");
  }
  if (kind === "donation") {
    await fulfillDonation(refId);
    redirect(`/donate/thank-you?id=${refId}`);
  } else {
    await fulfillOrder(refId);
    redirect(`/shop/thank-you?id=${refId}`);
  }
}

/** Campaign totals for the donate page. */
export async function getActiveCampaigns() {
  return db.select().from(campaign).where(eq(campaign.active, true));
}
