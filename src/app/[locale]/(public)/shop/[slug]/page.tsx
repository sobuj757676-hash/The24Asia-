import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/server/queries/public";
import { createOrder } from "@/server/actions/shop";

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
        <Link href="/shop" className="text-sm text-brand-700 dark:text-brand-300">← Shop</Link>
        <h1 className="mt-3 text-3xl font-extrabold">{product.name}</h1>
        <p className="mt-2 text-2xl font-bold text-brand-600">
          S${(product.priceCents / 100).toFixed(2)}
        </p>
        {product.description && (
          <p className="mt-3 text-[var(--muted)]">{product.description}</p>
        )}

        {inStock.length === 0 ? (
          <Badge tone="warning" className="mt-6">Out of stock</Badge>
        ) : (
          <form action={createOrder} className="mt-6 space-y-4">
            <Field label="Option" htmlFor="variantId" required>
              <Select id="variantId" name="variantId" required>
                {inStock.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} ({v.stock} left)
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Quantity" htmlFor="quantity" required>
              <Input id="quantity" name="quantity" type="number" min="1" max="20" defaultValue={1} required />
            </Field>
            <Field label="Fulfilment" htmlFor="fulfilment">
              <Select id="fulfilment" name="fulfilment" defaultValue="pickup">
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </Select>
            </Field>
            <Button type="submit" size="lg" className="w-full">
              Order now
            </Button>
          </form>
        )}
      </Container>
    </Section>
  );
}
