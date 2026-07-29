import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { VolunteerReviewButtons } from "@/components/admin/review-buttons";
import { getPendingVolunteerApplications } from "@/server/queries/admin";

export default async function AdminVolunteers({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("volunteer:review");

  const pending = await getPendingVolunteerApplications();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Volunteers</h1>
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
    </div>
  );
}
