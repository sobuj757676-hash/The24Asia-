import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { VolunteerReviewButtons } from "@/components/admin/review-buttons";
import { Field, Input, Select } from "@/components/ui/input";
import { getPendingVolunteerApplications, listActiveVolunteers } from "@/server/queries/admin";
import { awardRecognition } from "@/server/actions/attendance";

export default async function AdminVolunteers({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("volunteer:review");

  const [pending, volunteers] = await Promise.all([
    getPendingVolunteerApplications(),
    listActiveVolunteers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Volunteers</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/volunteers/opportunities">Opportunities</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/volunteers/hours">Hours</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/volunteers/expenses">Expenses</Link>
          </Button>
        </div>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-bold">
          Applications to review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <EmptyState title="No volunteer applications awaiting review" />
        ) : (
          <div className="space-y-2">
            {pending.map(({ application, person, opportunity }) => (
              <Card key={application.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {person.displayName ?? "Applicant"} →{" "}
                      {opportunity?.title ?? "General"}
                    </CardTitle>
                    {application.motivation && (
                      <p className="mt-1 max-w-prose text-sm text-[var(--muted)]">
                        {application.motivation}
                      </p>
                    )}
                  </div>
                  <VolunteerReviewButtons id={application.id} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Award recognition (VOL-014) */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Award recognition</h2>
        <Card>
          <CardBody>
            {volunteers.length === 0 ? (
              <EmptyState title="No active volunteers yet" />
            ) : (
              <form action={awardRecognition} className="grid gap-3 sm:grid-cols-3">
                <Field label="Volunteer" htmlFor="personId">
                  <Select id="personId" name="personId">
                    {volunteers.map((v) => (
                      <option key={v.personId} value={v.personId}>
                        {v.name ?? "Volunteer"} ({v.standing})
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Kind" htmlFor="kind">
                  <Select id="kind" name="kind" defaultValue="appreciation">
                    <option value="appreciation">Appreciation</option>
                    <option value="milestone">Milestone</option>
                    <option value="badge">Badge</option>
                  </Select>
                </Field>
                <Field label="Label" htmlFor="label">
                  <Input id="label" name="label" placeholder="e.g. 100 hours served" />
                </Field>
                <div className="sm:col-span-3">
                  <Button type="submit" size="sm">Award recognition</Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
