import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listAllListings, listMentorRequests } from "@/server/queries/support";
import { getById } from "@/server/queries/admin";
import { saveListing, deleteListing } from "@/server/actions/career";

export default async function AdminCareer({
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
  const [listings, mentorReqs] = await Promise.all([
    listAllListings(),
    listMentorRequests(),
  ]);
  const editing = await getById(listings, edit);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Career & mentorship</h1>

      <section>
        <h2 className="mb-3 text-lg font-bold">{editing ? "Edit listing" : "New opportunity listing"}</h2>
        <Card>
          <CardBody>
            <form action={saveListing} className="grid gap-4 sm:grid-cols-2">
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <Field label="Title" htmlFor="title" required>
                <Input id="title" name="title" defaultValue={editing?.title} required />
              </Field>
              <Field label="Role type" htmlFor="roleType">
                <Select id="roleType" name="roleType" defaultValue={editing?.roleType ?? "job"}>
                  <option value="job">Job</option>
                  <option value="internship">Internship</option>
                  <option value="training">Training</option>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description" htmlFor="description">
                  <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
                </Field>
              </div>
              <Field label="Compensation" htmlFor="compensation">
                <Input id="compensation" name="compensation" defaultValue={editing?.compensation ?? ""} />
              </Field>
              <Field label="Eligibility" htmlFor="eligibility">
                <Input id="eligibility" name="eligibility" defaultValue={editing?.eligibility ?? ""} />
              </Field>
              <Field label="Accountable contact" htmlFor="accountableContact">
                <Input id="accountableContact" name="accountableContact" defaultValue={editing?.accountableContact ?? ""} />
              </Field>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="verified" defaultChecked={editing?.verified ?? false} className="size-5" /> Verified
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="published" defaultChecked={editing?.published ?? false} className="size-5" /> Published
                </label>
              </div>
              <div className="sm:col-span-2"><Button type="submit">{editing ? "Save" : "Create listing"}</Button></div>
            </form>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Listings ({listings.length})</h2>
        <div className="space-y-2">
          {listings.map((l) => (
            <Card key={l.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-sm text-[var(--muted)]">{l.roleType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={l.published ? "success" : "neutral"}>{l.published ? "Published" : "Draft"}</Badge>
                  <ActionButton action={deleteListing.bind(null, l.id)} label="Delete" variant="danger" icon confirm="Delete listing?" successMessage="Deleted" />
                </div>
              </CardBody>
            </Card>
          ))}
          {listings.length === 0 && <EmptyState title="No listings yet" />}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Mentorship requests ({mentorReqs.length})</h2>
        <div className="space-y-2">
          {mentorReqs.map(({ match, menteeName }) => (
            <Card key={match.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{menteeName ?? "Learner"}</CardTitle>
                  <p className="text-sm text-[var(--muted)]">{match.topic}</p>
                </div>
                <Badge tone={match.status === "matched" || match.status === "active" ? "success" : "neutral"}>
                  {match.status}
                </Badge>
              </CardBody>
            </Card>
          ))}
          {mentorReqs.length === 0 && <EmptyState title="No mentorship requests" />}
        </div>
      </section>
    </div>
  );
}
