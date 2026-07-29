"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariant, shopOrder, orderLine } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getFlag, FLAGS } from "@/lib/flags";
import { audit } from "@/lib/audit";

/**
 * Creates a single-item order and routes to checkout (PRD MER-001/002).
 * Stock and payment are validated server-side.
 */
export async function createOrder(formData: FormData) {
  const parsed = z
    .object({
      variantId: z.string().min(1),
      quantity: z.coerce.number().min(1).max(20),
      fulfilment: z.enum(["pickup", "delivery"]).default("pickup"),
      purpose: z.string().max(300).optional(),
    })
    .safeParse({
      variantId: formData.get("variantId"),
      quantity: formData.get("quantity") ?? 1,
      fulfilment: formData.get("fulfilment") ?? "pickup",
      purpose: formData.get("purpose") || undefined,
    });
  if (!parsed.success) redirect("/shop?error=invalid");

  const variants = await db
    .select({
      id: productVariant.id,
      stock: productVariant.stock,
      productId: productVariant.productId,
    })
    .from(productVariant)
    .where(eq(productVariant.id, parsed.data.variantId))
    .limit(1);
  const variant = variants[0];
  if (!variant) redirect("/shop?error=notfound");
  if (variant.stock < parsed.data.quantity) redirect("/shop?error=stock");

  // Price is looked up from the product to avoid client tampering.
  const { product } = await import("@/db/schema");
  const prod = await db
    .select({ priceCents: product.priceCents })
    .from(product)
    .where(eq(product.id, variant.productId))
    .limit(1);
  const unit = prod[0]?.priceCents ?? 0;
  const total = unit * parsed.data.quantity;

  const user = await getCurrentUser();
  const paymentEnabled = await getFlag(FLAGS.MERCH_PAYMENT);

  const [order] = await db
    .insert(shopOrder)
    .values({
      personId: user?.personId || null,
      status: paymentEnabled ? "awaiting_payment" : "submitted",
      fulfilment: parsed.data.fulfilment,
      purpose: parsed.data.purpose,
      totalCents: total,
    })
    .returning({ id: shopOrder.id });

  await db.insert(orderLine).values({
    orderId: order.id,
    variantId: variant.id,
    quantity: parsed.data.quantity,
    unitPriceCents: unit,
  });

  await audit({
    actorId: user?.personId,
    action: "order.created",
    objectType: "shop_order",
    objectId: order.id,
    context: { totalCents: total },
  });

  if (!paymentEnabled) {
    // No payment required (e.g. free merch / pay-on-pickup) - order recorded.
    redirect(`/shop/thank-you?id=${order.id}`);
  }

  const provider = getPaymentProvider();
  const checkout = await provider.createCheckout({
    kind: "order",
    referenceId: order.id,
    amountCents: total,
    currency: "SGD",
    description: "24Asia shop order",
    successPath: `/shop/thank-you?id=${order.id}`,
    cancelPath: `/shop`,
  });
  if (checkout.providerReference) {
    await db
      .update(shopOrder)
      .set({ providerReference: checkout.providerReference })
      .where(eq(shopOrder.id, order.id));
  }
  redirect(checkout.url);
}
