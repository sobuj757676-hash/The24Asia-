import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { FormCard, CheckboxField } from "@/components/ui/form";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardBody } from "@/components/ui/card";
import { ActionButton } from "@/components/admin/row-actions";
import { listPartners, getById } from "@/server/queries/admin";
import { savePartner, deletePartner } from "@/server/actions/manage";
import { linkPartnerContact } from "@/server/actions/ops";
import { Building2 } from "lucide-react";

export default async function AdminPartners({
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
  const partners = await listPartners();
  const editing = await getById(partners, edit);

  return (
    <>
      <PageHeader
        title="Partners"
        description="Partner organisations shown publicly, and the contacts who can access the partner portal."
        breadcrumb={
          <Link href="/admin/content" className="hover:text-brand-700 dark:text-brand-300">
            ← Content
          </Link>
        }
      />

      <FormCard
        title={editing ? `Edit ${editing.name}` : "Add a partner"}
        action={savePartner}
        submitLabel={editing ? "Save changes" : "Add partner"}
        secondaryAction={
          editing ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/content/partners">Cancel</Link>
            </Button>
          ) : null
        }
      >
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <Field label="Organisation name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={editing?.name} required />
        </Field>
        <Field label="Type" htmlFor="type" hint="institution, employer, sponsor, venue…">
          <Input id="type" name="type" defaultValue={editing?.type ?? ""} />
        </Field>
        <Field label="Website" htmlFor="websiteUrl">
          <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={editing?.websiteUrl ?? ""} placeholder="https://…" />
        </Field>
        <Field label="Display order" htmlFor="displayOrder">
          <Input id="displayOrder" name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
        </Field>
        <CheckboxField
          name="verified"
          label="Verified"
          description="Due diligence completed"
          defaultChecked={editing?.verified ?? false}
        />
        <CheckboxField
          name="displayPublicly"
          label="Show publicly"
          description="Appears on the partners page"
          defaultChecked={editing?.displayPublicly ?? true}
        />
      </FormCard>

      <section className="mt-8">
        <SectionHeader
          title={`All partners (${partners.length})`}
          description="Link a contact by email to give them partner-portal access."
        />
        {partners.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" aria-hidden />}
            title="No partners yet"
            description="Add the organisations you collaborate with."
          />
        ) : (
          <div className="space-y-3">
            {partners.map((p) => (
              <Card key={p.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {p.name}
                        {p.verified && <Badge tone="success">Verified</Badge>}
                        <Badge tone={p.displayPublicly ? "info" : "neutral"}>
                          {p.displayPublicly ? "Public" : "Hidden"}
                        </Badge>
                      </p>
                      <p className="text-sm text-[var(--muted)]">{p.type ?? "Partner"}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/content/partners?edit=${p.id}`}>Edit</Link>
                      </Button>
                      <ActionButton
                        action={deletePartner.bind(null, p.id)}
                        label="Delete"
                        variant="danger"
                        icon
                        confirmTitle={`Delete ${p.name}?`}
                        confirm="Their listings and portal access will be removed. This cannot be undone."
                        successMessage="Partner deleted"
                      />
                    </div>
                  </div>

                  <form
                    action={linkPartnerContact}
                    className="flex flex-wrap items-end gap-2 border-t pt-4"
                  >
                    <input type="hidden" name="partnerId" value={p.id} />
                    <Field
                      label="Grant portal access"
                      htmlFor={`email-${p.id}`}
                      hint="They must have signed in once"
                    >
                      <Input
                        id={`email-${p.id}`}
                        name="email"
                        type="email"
                        placeholder="contact@partner.org"
                        className="w-full sm:w-64"
                      />
                    </Field>
                    <SubmitButton variant="outline" pendingLabel="Linking…">
                      Link contact
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
