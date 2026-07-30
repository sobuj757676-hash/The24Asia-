import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { listProductsWithVariants } from "@/server/queries/admin";
import { saveProduct, addVariant } from "@/server/actions/manage";
import { getFlag, FLAGS } from "@/lib/flags";
import { formatMoney } from "@/lib/utils";
import { ShoppingBag, PackageSearch, CreditCard, Info } from "lucide-react";

export default async function AdminShop({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("event:manage");
  const [products, paymentOn] = await Promise.all([
    listProductsWithVariants(),
    getFlag(FLAGS.MERCH_PAYMENT),
  ]);

  const published = products.filter((p) => p.product.published).length;
  const totalStock = products.reduce(
    (n, p) => n + p.variants.reduce((m, v) => m + v.stock, 0),
    0,
  );

  return (
    <>
      <PageHeader
        title="Shop"
        description="Merchandise sold to support our programs."
        actions={
          <Badge tone={paymentOn ? "success" : "warning"}>
            <CreditCard className="size-3.5" aria-hidden />
            Payment {paymentOn ? "enabled" : "disabled"}
          </Badge>
        }
      />

      {!paymentOn && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm dark:border-amber-800 dark:bg-amber-900/20">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <p>
            Checkout payment is turned off, so orders are recorded as requests for you to collect
            payment on pickup. Enable <span className="font-mono text-xs">merch.payment</span> in
            Feature flags to take payment online.
          </p>
        </div>
      )}

      <StatGrid cols={3}>
        <StatCard label="Products" value={products.length} icon={<ShoppingBag className="size-4" />} />
        <StatCard label="Published" value={published} icon={<ShoppingBag className="size-4" />} />
        <StatCard label="Units in stock" value={totalStock} icon={<PackageSearch className="size-4" />} />
      </StatGrid>

      <div className="mt-8">
        <FormCard
          title="Add a product"
          action={saveProduct}
          submitLabel="Create product"
        >
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required />
          </Field>
          <Field label="Price (cents, SGD)" htmlFor="priceCents" required hint="1500 = S$15.00">
            <Input id="priceCents" name="priceCents" type="number" min="0" defaultValue={0} required />
          </Field>
          <FormRow>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" />
            </Field>
          </FormRow>
          <CheckboxField name="published" label="Published" description="Visible in the public shop" />
        </FormCard>
      </div>

      <section className="mt-8">
        <SectionHeader title={`Products (${products.length})`} description="Add size or colour variants with their own stock." />
        {products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" aria-hidden />}
            title="No products yet"
            description="Create your first item, such as a volunteer t-shirt."
          />
        ) : (
          <div className="space-y-3">
            {products.map(({ product, variants }) => (
              <Card key={product.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {product.name}
                        <Badge tone={product.published ? "success" : "neutral"}>
                          {product.published ? "Published" : "Draft"}
                        </Badge>
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {formatMoney(product.priceCents, product.currency, locale)}
                      </p>
                    </div>
                  </div>

                  {variants.length > 0 ? (
                    <ul className="divide-y rounded-xl border">
                      {variants.map((v) => (
                        <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <span className="font-medium">{v.label}</span>
                          <span className="flex items-center gap-3 text-[var(--muted)]">
                            <span className="font-mono text-xs">{v.sku}</span>
                            <span className="tabular-nums">stock {v.stock}</span>
                            {v.stock <= v.reorderThreshold && <Badge tone="warning">Low</Badge>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">
                      No variants yet — add at least one so people can order.
                    </p>
                  )}

                  <form action={addVariant} className="flex flex-wrap items-end gap-2 border-t pt-4">
                    <input type="hidden" name="productId" value={product.id} />
                    <Field label="Variant" htmlFor={`label-${product.id}`} hint="e.g. M">
                      <Input id={`label-${product.id}`} name="label" className="w-24" required />
                    </Field>
                    <Field label="SKU" htmlFor={`sku-${product.id}`}>
                      <Input id={`sku-${product.id}`} name="sku" className="w-28" required />
                    </Field>
                    <Field label="Stock" htmlFor={`stock-${product.id}`}>
                      <Input id={`stock-${product.id}`} name="stock" type="number" min="0" defaultValue={0} className="w-20" />
                    </Field>
                    <SubmitButton variant="outline" pendingLabel="Adding…">
                      Add variant
                    </SubmitButton>
                  </form>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
