import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { Heart, PackageX, Truck } from "lucide-react";
import { getProductBySlug } from "@/server/queries/public";
import { createOrder } from "@/server/actions/shop";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return { title: "Product" };
  return {
    title: data.product.name,
    description: data.product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const data = await getProductBySlug(slug);
  if (!data) notFound();
  const { product, variants } = data;
  const inStock = variants.filter((v) => v.stock > 0);

  return (
    <Section>
      <Container className="max-w-xl">
        <Link
          href="/shop"
          className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          ← Shop
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{product.name}</h1>
        <p className="mt-2 text-2xl font-bold text-brand-600">
          {formatMoney(product.priceCents, product.currency ?? "SGD", locale)}
        </p>
        {product.description && (
          <p className="mt-3 leading-relaxed text-[var(--muted)]">
            {product.description}
          </p>
        )}

        <p className="mt-4 flex items-start gap-2 rounded-2xl border bg-brand-50/60 p-4 text-sm dark:bg-brand-900/20">
          <Heart className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          <span>
            Every purchase funds our free training and community programmes — there
            is no external profit margin on 24Asia merchandise.
          </span>
        </p>

        {inStock.length === 0 ? (
          <Card className="mt-6">
            <CardBody className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                <PackageX className="size-6" aria-hidden />
              </span>
              <p className="mt-3 font-semibold">Out of stock</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                This item has sold out. We restock in batches — or you can support us
                directly instead.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button asChild size="sm">
                  <Link href="/donate">Donate instead</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/shop">Other items</Link>
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardBody>
              <form action={createOrder} className="space-y-4">
                <Field label="Option" htmlFor="variantId" required>
                  <Select id="variantId" name="variantId" required>
                    {inStock.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} — {v.stock} left
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Quantity"
                  htmlFor="quantity"
                  hint="Up to 20 per order."
                  required
                >
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="20"
                    defaultValue={1}
                    required
                  />
                </Field>
                <Field
                  label="How would you like to receive it?"
                  htmlFor="fulfilment"
                >
                  <Select id="fulfilment" name="fulfilment" defaultValue="pickup">
                    <option value="pickup">Collect from us (free)</option>
                    <option value="delivery">Delivery</option>
                  </Select>
                </Field>
                <SubmitButton size="lg" className="w-full" pendingLabel="Preparing order…">
                  Order now
                </SubmitButton>
                <p className="flex items-start gap-2 text-xs text-[var(--muted)]">
                  <Truck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  We&apos;ll confirm collection or delivery details with you before
                  anything is dispatched.
                </p>
              </form>
            </CardBody>
          </Card>
        )}
      </Container>
    </Section>
  );
}
