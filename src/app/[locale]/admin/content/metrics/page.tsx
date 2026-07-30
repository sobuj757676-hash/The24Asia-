import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionButton } from "@/components/admin/row-actions";
import { Card, CardBody } from "@/components/ui/card";
import { listMetrics, getById } from "@/server/queries/admin";
import { saveMetric, deleteMetric } from "@/server/actions/manage";
import { formatDate } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

export default async function AdminMetrics({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { locale } = await params;
  const { edit } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("content:publish");

  const metrics = await listMetrics();
  const editing = await getById(metrics, edit);

  return (
    <>
      <PageHeader
        title="Impact metrics"
        description="Every public number must have a definition, a source and an “as of” date so the figures we publish are defensible."
        breadcrumb={
          <Link href="/admin/content" className="hover:text-brand-700 dark:text-brand-300">
            ← Content
          </Link>
        }
      />

      <FormCard
        title={editing ? `Edit ${editing.label}` : "Add a metric"}
        action={saveMetric}
        submitLabel={editing ? "Save changes" : "Add metric"}
        secondaryAction={
          editing ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/content/metrics">Cancel</Link>
            </Button>
          ) : null
        }
      >
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <Field label="Key" htmlFor="key" required hint="Stable identifier, e.g. migrants_trained">
          <Input id="key" name="key" defaultValue={editing?.key} required />
        </Field>
        <Field label="Label" htmlFor="label" required hint="Shown under the number">
          <Input id="label" name="label" defaultValue={editing?.label} required />
        </Field>
        <Field label="Display value" htmlFor="value" required hint='Exactly as shown, e.g. "5300+"'>
          <Input id="value" name="value" defaultValue={editing?.value} required />
        </Field>
        <Field label="Numeric value" htmlFor="numericValue" hint="Used for charts and sorting">
          <Input id="numericValue" name="numericValue" type="number" defaultValue={editing?.numericValue ?? ""} />
        </Field>
        <FormRow>
          <Field label="Definition" htmlFor="definition" required hint="How exactly is this counted?">
            <Textarea id="definition" name="definition" defaultValue={editing?.definition} required />
          </Field>
        </FormRow>
        <Field label="Source" htmlFor="source" hint="Where the number comes from">
          <Input id="source" name="source" defaultValue={editing?.source ?? ""} />
        </Field>
        <Field label="Display order" htmlFor="displayOrder">
          <Input id="displayOrder" name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
        </Field>
        <CheckboxField
          name="publishedPublicly"
          label="Publish publicly"
          description="Show on the home and impact pages"
          defaultChecked={editing?.publishedPublicly ?? true}
        />
      </FormCard>

      <section className="mt-8">
        <SectionHeader title={`All metrics (${metrics.length})`} />
        {metrics.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="size-5" aria-hidden />}
            title="No metrics yet"
            description="Add your impact figures so they appear on the public site."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((m) => (
              <Card key={m.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-2xl font-bold tabular-nums text-brand-600">{m.value}</p>
                      <p className="text-sm font-medium">{m.label}</p>
                    </div>
                    <Badge tone={m.publishedPublicly ? "success" : "neutral"}>
                      {m.publishedPublicly ? "Public" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--muted)]">{m.definition}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    As of {formatDate(m.asOf, locale)}
                    {m.source ? ` · ${m.source}` : ""}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/content/metrics?edit=${m.id}`}>Edit</Link>
                    </Button>
                    <ActionButton
                      action={deleteMetric.bind(null, m.id)}
                      label="Delete"
                      variant="danger"
                      icon
                      confirmTitle={`Delete "${m.label}"?`}
                      confirm="This metric will be removed from the public site. This cannot be undone."
                      successMessage="Metric deleted"
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
