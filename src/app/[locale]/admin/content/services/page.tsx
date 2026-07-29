import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listServices, getById } from "@/server/queries/admin";
import { saveService, deleteService } from "@/server/actions/manage";

export default async function AdminServices({
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

  const services = await listServices();
  const editing = await getById(services, edit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Trusted services</h1>
        <Link href="/admin/content" className="text-sm text-brand-700">
          ← Content
        </Link>
      </div>

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">
            {editing ? "Edit service" : "Add service"}
          </h2>
          <form action={saveService} className="grid gap-4 sm:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Name" htmlFor="name" required>
              <Input id="name" name="name" defaultValue={editing?.name} required />
            </Field>
            <Field label="Topic" htmlFor="topic">
              <Select id="topic" name="topic" defaultValue={editing?.topic ?? "wellbeing"}>
                <option value="wellbeing">Wellbeing</option>
                <option value="career">Career</option>
                <option value="health">Health</option>
                <option value="legal_info">Legal info</option>
                <option value="financial">Financial</option>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
              </Field>
            </div>
            <Field label="Contact phone" htmlFor="contactPhone">
              <Input id="contactPhone" name="contactPhone" defaultValue={editing?.contactPhone ?? ""} />
            </Field>
            <Field label="Contact URL" htmlFor="contactUrl">
              <Input id="contactUrl" name="contactUrl" defaultValue={editing?.contactUrl ?? ""} />
            </Field>
            <Field label="Cost" htmlFor="cost">
              <Input id="cost" name="cost" defaultValue={editing?.cost ?? ""} placeholder="Free" />
            </Field>
            <Field label="Operating hours" htmlFor="operatingHours">
              <Input id="operatingHours" name="operatingHours" defaultValue={editing?.operatingHours ?? ""} placeholder="24/7" />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isUrgentHelp" defaultChecked={editing?.isUrgentHelp ?? false} className="size-5" />
              Urgent help (shown on urgent-help page)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={editing?.published ?? false} className="size-5" />
              Published
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">{editing ? "Save changes" : "Add service"}</Button>
              {editing && (
                <Button asChild variant="ghost">
                  <Link href="/admin/content/services">Cancel</Link>
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {services.map((s) => (
          <Card key={s.id}>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  {s.topic} · {s.contactPhone ?? s.contactUrl ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {s.isUrgentHelp && <Badge tone="danger">Urgent</Badge>}
                <Badge tone={s.published ? "success" : "neutral"}>
                  {s.published ? "Published" : "Draft"}
                </Badge>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/content/services?edit=${s.id}`}>Edit</Link>
                </Button>
                <ActionButton
                  action={deleteService.bind(null, s.id)}
                  label="Delete"
                  variant="danger"
                  icon
                  confirm={`Delete "${s.name}"?`}
                  successMessage="Deleted"
                />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
