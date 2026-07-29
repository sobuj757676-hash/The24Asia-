import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listProductsWithVariants } from "@/server/queries/admin";
import { saveProduct, addVariant } from "@/server/actions/manage";
import { getFlag, FLAGS } from "@/lib/flags";

export default async function AdminShop({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("event:manage");
  const products = await listProductsWithVariants();
  const paymentOn = await getFlag(FLAGS.MERCH_PAYMENT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Shop</h1>
        <Badge tone={paymentOn ? "success" : "neutral"}>
          Payment {paymentOn ? "enabled" : "disabled"}
        </Badge>
      </div>

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">New product</h2>
          <form action={saveProduct} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" required>
              <Input id="name" name="name" required />
            </Field>
            <Field label="Price (cents, SGD)" htmlFor="priceCents" required>
              <Input id="priceCents" name="priceCents" type="number" defaultValue={0} required />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" className="size-5" /> Published
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">Create product</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {products.length === 0 ? (
        <EmptyState title="No products yet" />
      ) : (
        <div className="space-y-4">
          {products.map(({ product, variants }) => (
            <Card key={product.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {product.name} · S${(product.priceCents / 100).toFixed(2)}
                  </CardTitle>
                  <Badge tone={product.published ? "success" : "neutral"}>
                    {product.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {variants.map((v) => (
                    <li key={v.id} className="flex justify-between border-b py-1">
                      <span>{v.label} ({v.sku})</span>
                      <span className="text-[var(--muted)]">stock: {v.stock}</span>
                    </li>
                  ))}
                  {variants.length === 0 && (
                    <li className="text-[var(--muted)]">No variants yet.</li>
                  )}
                </ul>
                <form action={addVariant} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="productId" value={product.id} />
                  <Field label="Variant label" htmlFor={`label-${product.id}`}>
                    <Input id={`label-${product.id}`} name="label" placeholder="M" className="w-24" />
                  </Field>
                  <Field label="SKU" htmlFor={`sku-${product.id}`}>
                    <Input id={`sku-${product.id}`} name="sku" placeholder="TS-M" className="w-28" />
                  </Field>
                  <Field label="Stock" htmlFor={`stock-${product.id}`}>
                    <Input id={`stock-${product.id}`} name="stock" type="number" defaultValue={0} className="w-20" />
                  </Field>
                  <Button type="submit" size="sm" variant="outline">Add variant</Button>
                </form>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
