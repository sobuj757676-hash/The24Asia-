import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { ActionButton } from "@/components/admin/row-actions";
import { listServices, getById } from "@/server/queries/admin";
import { saveService, deleteService } from "@/server/actions/manage";
import { LifeBuoy } from "lucide-react";

type Row = Awaited<ReturnType<typeof listServices>>[number];

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

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Service",
      primary: true,
      render: (s) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{s.name}</span>
          {s.isUrgentHelp && <Badge tone="danger">Urgent help</Badge>}
        </span>
      ),
    },
    { key: "topic", label: "Topic", render: (s) => <Badge>{s.topic}</Badge> },
    {
      key: "contact",
      label: "Contact",
      render: (s) => (
        <span className="text-[var(--muted)]">{s.contactPhone ?? s.contactUrl ?? "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (s) => (
        <Badge tone={s.published ? "success" : "neutral"}>
          {s.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (s) => (
        <span className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/content/services?edit=${s.id}`}>Edit</Link>
          </Button>
          <ActionButton
            action={deleteService.bind(null, s.id)}
            label="Delete"
            variant="danger"
            icon
            confirmTitle={`Delete "${s.name}"?`}
            confirm="This service will no longer appear in the public support directory. This cannot be undone."
            successMessage="Service deleted"
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Trusted services"
        description="The directory shown on the public support page. Urgent-help entries also appear on the emergency page."
        breadcrumb={
          <Link href="/admin/content" className="hover:text-brand-700">
            ← Content
          </Link>
        }
      />

      <FormCard
        title={editing ? `Edit ${editing.name}` : "Add a service"}
        description="Only publish services you have verified."
        action={saveService}
        submitLabel={editing ? "Save changes" : "Add service"}
        secondaryAction={
          editing ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/content/services">Cancel</Link>
            </Button>
          ) : null
        }
      >
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={editing?.name} required />
        </Field>
        <Field label="Topic" htmlFor="topic">
          <Select id="topic" name="topic" defaultValue={editing?.topic ?? "wellbeing"}>
            <option value="wellbeing">Wellbeing</option>
            <option value="career">Career</option>
            <option value="health">Health</option>
            <option value="legal_info">Legal information</option>
            <option value="financial">Financial</option>
          </Select>
        </Field>
        <FormRow>
          <Field label="Description" htmlFor="description">
            <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
          </Field>
        </FormRow>
        <Field label="Contact phone" htmlFor="contactPhone">
          <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={editing?.contactPhone ?? ""} />
        </Field>
        <Field label="Contact website" htmlFor="contactUrl">
          <Input id="contactUrl" name="contactUrl" type="url" defaultValue={editing?.contactUrl ?? ""} placeholder="https://…" />
        </Field>
        <Field label="Cost" htmlFor="cost">
          <Input id="cost" name="cost" defaultValue={editing?.cost ?? ""} placeholder="Free" />
        </Field>
        <Field label="Operating hours" htmlFor="operatingHours">
          <Input id="operatingHours" name="operatingHours" defaultValue={editing?.operatingHours ?? ""} placeholder="24/7" />
        </Field>
        <CheckboxField
          name="isUrgentHelp"
          label="Urgent help"
          description="Also show on the urgent-help page"
          defaultChecked={editing?.isUrgentHelp ?? false}
        />
        <CheckboxField
          name="published"
          label="Published"
          description="Visible on the public site"
          defaultChecked={editing?.published ?? false}
        />
      </FormCard>

      <section className="mt-8">
        <SectionHeader title={`All services (${services.length})`} />
        {services.length === 0 ? (
          <EmptyState
            icon={<LifeBuoy className="size-5" aria-hidden />}
            title="No services yet"
            description="Add verified local services so community members can find trusted help."
          />
        ) : (
          <DataList columns={columns} rows={services} getKey={(s) => s.id} caption="Trusted services" />
        )}
      </section>
    </>
  );
}
