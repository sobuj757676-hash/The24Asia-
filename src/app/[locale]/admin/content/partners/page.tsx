import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listPartners, getById } from "@/server/queries/admin";
import { savePartner, deletePartner } from "@/server/actions/manage";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Partners</h1>
        <Link href="/admin/content" className="text-sm text-brand-700">← Content</Link>
      </div>
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">{editing ? "Edit partner" : "Add partner"}</h2>
          <form action={savePartner} className="grid gap-4 sm:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Name" htmlFor="name" required>
              <Input id="name" name="name" defaultValue={editing?.name} required />
            </Field>
            <Field label="Type" htmlFor="type">
              <Input id="type" name="type" defaultValue={editing?.type ?? ""} placeholder="institution / employer / sponsor" />
            </Field>
            <Field label="Website" htmlFor="websiteUrl">
              <Input id="websiteUrl" name="websiteUrl" defaultValue={editing?.websiteUrl ?? ""} />
            </Field>
            <Field label="Display order" htmlFor="displayOrder">
              <Input id="displayOrder" name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="verified" defaultChecked={editing?.verified ?? false} className="size-5" /> Verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="displayPublicly" defaultChecked={editing?.displayPublicly ?? true} className="size-5" /> Show publicly
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">{editing ? "Save" : "Add partner"}</Button>
              {editing && <Button asChild variant="ghost"><Link href="/admin/content/partners">Cancel</Link></Button>}
            </div>
          </form>
        </CardBody>
      </Card>
      <div className="space-y-2">
        {partners.map((p) => (
          <Card key={p.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-[var(--muted)]">{p.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={p.displayPublicly ? "success" : "neutral"}>{p.displayPublicly ? "Public" : "Hidden"}</Badge>
                <Button asChild size="sm" variant="outline"><Link href={`/admin/content/partners?edit=${p.id}`}>Edit</Link></Button>
                <ActionButton action={deletePartner.bind(null, p.id)} label="Delete" variant="danger" icon confirm="Delete partner?" successMessage="Deleted" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
