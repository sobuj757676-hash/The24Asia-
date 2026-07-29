import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listMetrics, getById } from "@/server/queries/admin";
import { saveMetric, deleteMetric } from "@/server/actions/manage";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Impact metrics</h1>
        <Link href="/admin/content" className="text-sm text-brand-700">← Content</Link>
      </div>

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">{editing ? "Edit metric" : "Add metric"}</h2>
          <form action={saveMetric} className="grid gap-4 sm:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Key" htmlFor="key" required hint="stable id, e.g. migrants_trained">
              <Input id="key" name="key" defaultValue={editing?.key} required />
            </Field>
            <Field label="Label" htmlFor="label" required>
              <Input id="label" name="label" defaultValue={editing?.label} required />
            </Field>
            <Field label="Display value" htmlFor="value" required hint='e.g. "5300+"'>
              <Input id="value" name="value" defaultValue={editing?.value} required />
            </Field>
            <Field label="Numeric value" htmlFor="numericValue">
              <Input id="numericValue" name="numericValue" type="number" defaultValue={editing?.numericValue ?? ""} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Definition" htmlFor="definition" required>
                <Textarea id="definition" name="definition" defaultValue={editing?.definition} required />
              </Field>
            </div>
            <Field label="Source" htmlFor="source">
              <Input id="source" name="source" defaultValue={editing?.source ?? ""} />
            </Field>
            <Field label="Display order" htmlFor="displayOrder">
              <Input id="displayOrder" name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="publishedPublicly" defaultChecked={editing?.publishedPublicly ?? true} className="size-5" />
              Publish publicly
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">{editing ? "Save" : "Add metric"}</Button>
              {editing && <Button asChild variant="ghost"><Link href="/admin/content/metrics">Cancel</Link></Button>}
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {metrics.map((m) => (
          <Card key={m.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{m.value} · {m.label}</p>
                <p className="text-sm text-[var(--muted)]">{m.definition}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={m.publishedPublicly ? "success" : "neutral"}>
                  {m.publishedPublicly ? "Public" : "Hidden"}
                </Badge>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/content/metrics?edit=${m.id}`}>Edit</Link>
                </Button>
                <ActionButton action={deleteMetric.bind(null, m.id)} label="Delete" variant="danger" icon confirm="Delete metric?" successMessage="Deleted" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
