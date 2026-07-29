import "server-only";
import { env } from "@/env";

export type CheckoutInput = {
  kind: "donation" | "order";
  referenceId: string; // donation.id or order.id
  amountCents: number;
  currency: string;
  description: string;
  successPath: string; // relative path
  cancelPath: string;
};

export type CheckoutResult = {
  url: string;
  providerReference?: string;
};

export interface PaymentProvider {
  readonly mode: "stripe" | "test";
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  refund(providerReference: string, amountCents?: number): Promise<void>;
}

/**
 * Stripe-backed provider (used when STRIPE_SECRET_KEY is set). Card data never
 * touches our servers - Stripe Checkout hosts the payment page (PRD FUND-001).
 */
class StripeProvider implements PaymentProvider {
  readonly mode = "stripe" as const;

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!);
    const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amountCents,
            product_data: { name: input.description },
          },
        },
      ],
      metadata: { kind: input.kind, referenceId: input.referenceId },
      success_url: `${base}${input.successPath}`,
      cancel_url: `${base}${input.cancelPath}`,
    });
    return { url: session.url ?? input.cancelPath, providerReference: session.id };
  }

  async refund(providerReference: string, amountCents?: number): Promise<void> {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!);
    // providerReference is a checkout session id -> resolve its payment intent.
    const session = await stripe.checkout.sessions.retrieve(providerReference);
    const pi =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!pi) return;
    await stripe.refunds.create({ payment_intent: pi, amount: amountCents });
  }
}

/**
 * Test provider: no external processor. Routes the user to an internal
 * confirmation page that simulates a successful payment via a signed action.
 * Lets the company run the entire flow before wiring Stripe.
 */
class TestProvider implements PaymentProvider {
  readonly mode = "test" as const;

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const url = `/pay/${input.kind}/${input.referenceId}`;
    return { url, providerReference: `test_${input.referenceId}` };
  }

  async refund(): Promise<void> {
    // no-op in test mode
  }
}

export function getPaymentProvider(): PaymentProvider {
  return env.STRIPE_SECRET_KEY ? new StripeProvider() : new TestProvider();
}

export const PAYMENTS_MODE: "stripe" | "test" = env.STRIPE_SECRET_KEY
  ? "stripe"
  : "test";
