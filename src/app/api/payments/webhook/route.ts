import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { fulfillDonation, fulfillOrder } from "@/lib/payments/fulfill";

/**
 * Stripe webhook (PRD FUND-003): donation/order completion is confirmed here
 * from a signed provider event, not from the browser redirect.
 */
export async function POST(req: NextRequest) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "payments not configured" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  const body = await req.text();
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  let evt: import("stripe").Stripe.Event;
  try {
    evt = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (evt.type === "checkout.session.completed") {
    const session = evt.data.object as import("stripe").Stripe.Checkout.Session;
    const kind = session.metadata?.kind;
    const referenceId = session.metadata?.referenceId;
    if (referenceId && kind === "donation") {
      await fulfillDonation(referenceId, session.id);
    } else if (referenceId && kind === "order") {
      await fulfillOrder(referenceId, session.id);
    }
  }

  return NextResponse.json({ received: true });
}
