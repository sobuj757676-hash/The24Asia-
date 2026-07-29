import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { listAssets, listVariantsForStock } from "@/server/queries/ops";
import { saveAsset, adjustStock } from "@/server/actions/ops";

export default async function AdminAssets({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("event:manage");
  const [assets, variants] = await Promise.all([listAssets(), listVariantsForStock()]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Assets & inventory</h1>

      <section>
        <h2 className="mb-3 text-lg font-bold">Asset register</h2>
        <Card>
          <CardBody>
            <form action={saveAsset} className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" htmlFor="name"><Input id="name" name="name" required /></Field>
              <Field label="Identifier" htmlFor="identifier"><Input id="identifier" name="identifier" required /></Field>
              <Field label="Category" htmlFor="category"><Input id="category" name="category" defaultValue="equipment" /></Field>
              <Field label="Location" htmlFor="location"><Input id="location" name="location" /></Field>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Add asset</Button></div>
            </form>
            <ul className="mt-4 space-y-1 text-sm">
              {assets.map((a) => (
                <li key={a.id} className="flex items-center justify-between border-b py-2">
                  <span>{a.name} <span className="text-xs text-[var(--muted)]">{a.identifier}</span></span>
                  <Badge>{a.condition}</Badge>
                </li>
              ))}
              {assets.length === 0 && <li className="list-none"><EmptyState title="No assets yet" /></li>}
            </ul>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Inventory (product stock)</h2>
        {variants.length === 0 ? (
          <EmptyState title="No product variants yet" body="Add products in the Shop admin." />
        ) : (
          <div className="space-y-2">
            {variants.map(({ variant, productName }) => (
              <Card key={variant.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{productName} · {variant.label}</p>
                    <p className="text-sm text-[var(--muted)]">
                      SKU {variant.sku} · stock {variant.stock}
                      {variant.stock <= variant.reorderThreshold && (
                        <Badge tone="warning" className="ml-2">Low stock</Badge>
                      )}
                    </p>
                  </div>
                  <form action={adjustStock} className="flex items-end gap-2">
                    <input type="hidden" name="variantId" value={variant.id} />
                    <Field label="Adjust (+/-)" htmlFor={`d-${variant.id}`}>
                      <Input id={`d-${variant.id}`} name="delta" type="number" defaultValue={0} className="w-24" />
                    </Field>
                    <Input name="reason" placeholder="reason" className="w-32" />
                    <Button type="submit" size="sm" variant="outline">Apply</Button>
                  </form>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
