import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CheckCircle2, Clock, FileCheck2 } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getMyVolunteerApplications } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My applications", robots: { index: false } };

const OPEN_STATUSES = new Set([
  "submitted",
  "screening_pending",
  "under_review",
  "interview",
  "more_information",
]);

export default async function VolunteerApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const apps = await getMyVolunteerApplications(user.personId);

  const open = apps.filter((a) => OPEN_STATUSES.has(a.application.status));
  const approved = apps.filter((a) => a.application.status === "approved");

  return (
    <>
      <PageHeader
        title="My applications"
        description="Track every volunteer role you have applied for and what happens next."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/volunteer">Find an opportunity</Link>
          </Button>
        }
      />

      {apps.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="size-5" aria-hidden />}
          title="No applications yet"
          description="Browse our open volunteer roles and apply — you'll be able to follow your progress here."
          action={
            <Button asChild size="sm">
              <Link href="/volunteer">Browse opportunities</Link>
            </Button>
          }
        />
      ) : (
        <>
          <StatGrid cols={3}>
            <StatCard
              label="Total applications"
              value={apps.length}
              icon={<FileCheck2 className="size-4" />}
              tone="accent"
            />
            <StatCard
              label="In progress"
              value={open.length}
              hint={open.length > 0 ? "We'll email you with updates" : "Nothing waiting on us"}
              icon={<Clock className="size-4" />}
              tone="accent"
            />
            <StatCard
              label="Approved"
              value={approved.length}
              icon={<CheckCircle2 className="size-4" />}
              tone="accent"
            />
          </StatGrid>

          <ul className="mt-6 space-y-3">
            {apps.map(({ application, opportunity }) => (
              <li key={application.id}>
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                      <div className="min-w-0">
                        <h2 className="font-semibold">
                          {opportunity?.title ?? "General volunteer application"}
                        </h2>
                        <p className="mt-0.5 text-sm text-[var(--muted)]">
                          Applied {formatDate(application.createdAt, locale)}
                          {opportunity?.locationName ? ` · ${opportunity.locationName}` : ""}
                          {opportunity?.commitment ? ` · ${opportunity.commitment}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    {application.decisionReason && (
                      <p className="rounded-xl bg-ink-50 px-3 py-2 text-sm dark:bg-ink-800">
                        <span className="font-medium">Update from the team: </span>
                        {application.decisionReason}
                      </p>
                    )}

                    {application.status === "approved" && (
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <Link href="/volunteer-portal/shifts">Pick a shift</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/volunteer-portal/profile">Complete your profile</Link>
                        </Button>
                      </div>
                    )}

                    {application.status === "more_information" && (
                      <p className="text-sm text-[var(--muted)]">
                        We need a little more information. Please{" "}
                        <Link href="/support" className="font-medium underline">
                          contact the volunteering team
                        </Link>
                        .
                      </p>
                    )}
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
