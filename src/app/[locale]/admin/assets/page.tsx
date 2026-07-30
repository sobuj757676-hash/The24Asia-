import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { FormCard } from "@/components/ui/form";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { listAssets, listVariantsForStock } from "@/server/queries/ops";
import { saveAsset, adjustStock } from "@/server/actions/ops";
import { Boxes, PackageSearch, TriangleAlert } from "lucide-react";

type AssetRow = Awaited<ReturnType<typeof listAssets>>[number];

export default async function AdminAssets({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("event:manage");
  const [assets, variants] = await Promise.all([listAssets(), listVariantsForStock()]);

  const lowStock = variants.filter((v) => v.variant.stock <= v.variant.reorderThreshold);
  const totalStock = variants.reduce((n, v) => n + v.variant.stock, 0);

  const assetColumns: Column<AssetRow>[] = [
    {
      key: "name",
      label: "Asset",
      primary: true,
      render: (a) => <span className="font-medium">{a.name}</span>,
    },
    {
      key: "id",
      label: "Identifier",
      render: (a) => <span className="font-mono text-xs text-[var(--muted)]">{a.identifier}</span>,
    },
    { key: "category", label: "Category", render: (a) => <Badge>{a.category}</Badge> },
    {
      key: "location",
      label: "Location",
      render: (a) => <span className="text-[var(--muted)]">{a.location ?? "—"}</span>,
    },
    {
      key: "condition",
      label: "Condition",
      align: "right",
      render: (a) => <Badge tone={a.condition === "good" ? "success" : "warning"}>{a.condition}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Assets & inventory"
        description="Track equipment the organisation owns and the stock behind merchandise."
      />

      <StatGrid cols={3}>
        <StatCard label="Registered assets" value={assets.length} icon={<Boxes className="size-4" />} />
        <StatCard label="Items in stock" value={totalStock} icon={<PackageSearch className="size-4" />} />
        <StatCard
          label="Low stock variants"
          value={lowStock.length}
          icon={<TriangleAlert className="size-4" />}
          tone={lowStock.length > 0 ? "accent" : "neutral"}
        />
      </StatGrid>

      <section className="mt-8">
        <SectionHeader title="Asset register" />
        <FormCard action={saveAsset} submitLabel="Add asset">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required />
          </Field>
          <Field label="Identifier" htmlFor="identifier" required hint="Asset tag or serial number">
            <Input id="identifier" name="identifier" required />
          </Field>
          <Field label="Category" htmlFor="category">
            <Input id="category" name="category" defaultValue="equipment" />
          </Field>
          <Field label="Location" htmlFor="location">
            <Input id="location" name="location" />
          </Field>
        </FormCard>

        <div className="mt-4">
          {assets.length === 0 ? (
            <EmptyState
              compact
              icon={<Boxes className="size-5" aria-hidden />}
              title="No assets registered"
              description="Add laptops, projectors, banners and other equipment you lend out."
            />
          ) : (
            <DataList columns={assetColumns} rows={assets} getKey={(a) => a.id} caption="Asset register" />
          )}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader
          title="Merchandise stock"
          description="Adjustments are recorded as stock movements with your name."
        />
        {variants.length === 0 ? (
          <EmptyState
            compact
            icon={<PackageSearch className="size-5" aria-hidden />}
            title="No product variants yet"
            description="Add products and their size options in the Shop area first."
          />
        ) : (
          <div className="space-y-2">
            {variants.map(({ variant, productName }) => {
              const low = variant.stock <= variant.reorderThreshold;
              return (
                <Card key={variant.id} className={low ? "border-amber-300 dark:border-amber-800" : undefined}>
                  <CardBody className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        {productName} · {variant.label}
                        {low && <Badge tone="warning">Low stock</Badge>}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        SKU <span className="font-mono text-xs">{variant.sku}</span> · in stock{" "}
                        <span className="font-semibold tabular-nums">{variant.stock}</span> · reorder at{" "}
                        {variant.reorderThreshold}
                      </p>
                    </div>
                    <form action={adjustStock} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="variantId" value={variant.id} />
                      <Field label="Adjust by" htmlFor={`d-${variant.id}`} hint="Use −5 to remove 5">
                        <Input
                          id={`d-${variant.id}`}
                          name="delta"
                          type="number"
                          defaultValue={0}
                          className="w-24"
                        />
                      </Field>
                      <Field label="Reason" htmlFor={`r-${variant.id}`}>
                        <Input
                          id={`r-${variant.id}`}
                          name="reason"
                          placeholder="restock"
                          className="w-32"
                        />
                      </Field>
                      <SubmitButton variant="outline" pendingLabel="Applying…">
                        Apply
                      </SubmitButton>
                    </form>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
