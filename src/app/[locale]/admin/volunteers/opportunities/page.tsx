import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listOpportunitiesAll, getById } from "@/server/queries/admin";
import { saveOpportunity, deleteOpportunity } from "@/server/actions/manage";

export default async function AdminOpportunities({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { locale } = await params;
  const { edit } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("opportunity:manage");
  const opps = await listOpportunitiesAll();
  const editing = await getById(opps, edit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Volunteer opportunities</h1>
        <Link href="/admin/volunteers" className="text-sm text-brand-700">← Volunteers</Link>
      </div>
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">{editing ? "Edit opportunity" : "New opportunity"}</h2>
          <form action={saveOpportunity} className="grid gap-4 sm:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" defaultValue={editing?.title} required />
            </Field>
            <Field label="Commitment" htmlFor="commitment">
              <Input id="commitment" name="commitment" defaultValue={editing?.commitment ?? ""} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Purpose" htmlFor="purpose">
                <Textarea id="purpose" name="purpose" defaultValue={editing?.purpose ?? ""} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Duties" htmlFor="duties">
                <Textarea id="duties" name="duties" defaultValue={editing?.duties ?? ""} />
              </Field>
            </div>
            <Field label="Location" htmlFor="locationName">
              <Input id="locationName" name="locationName" defaultValue={editing?.locationName ?? ""} />
            </Field>
            <Field label="Risk level" htmlFor="riskLevel">
              <Select id="riskLevel" name="riskLevel" defaultValue={editing?.riskLevel ?? "low"}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Skills (comma separated)" htmlFor="skillsRequired">
              <Input id="skillsRequired" name="skillsRequired" defaultValue={(editing?.skillsRequired ?? []).join(", ")} />
            </Field>
            <Field label="Capacity" htmlFor="capacity">
              <Input id="capacity" name="capacity" type="number" defaultValue={editing?.capacity ?? ""} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="requiresTraining" defaultChecked={editing?.requiresTraining ?? false} className="size-5" /> Requires training
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={editing?.published ?? false} className="size-5" /> Published
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
              {editing && <Button asChild variant="ghost"><Link href="/admin/volunteers/opportunities">Cancel</Link></Button>}
            </div>
          </form>
        </CardBody>
      </Card>
      <div className="space-y-2">
        {opps.map((o) => (
          <Card key={o.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{o.title}</p>
                <p className="text-sm text-[var(--muted)]">{o.riskLevel} risk · {o.commitment}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={o.published ? "success" : "neutral"}>{o.published ? "Published" : "Draft"}</Badge>
                <Button asChild size="sm" variant="outline"><Link href={`/admin/volunteers/opportunities?edit=${o.id}`}>Edit</Link></Button>
                <ActionButton action={deleteOpportunity.bind(null, o.id)} label="Delete" variant="danger" icon confirm="Delete opportunity?" successMessage="Deleted" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
