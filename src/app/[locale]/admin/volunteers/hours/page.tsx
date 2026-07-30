import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { CheckCircle2, Clock, Users } from "lucide-react";
import { ActionButton } from "@/components/admin/row-actions";
import { listPendingHours } from "@/server/queries/admin";
import { decideHours } from "@/server/actions/volunteering";
import { formatDate } from "@/lib/utils";

type Row = Awaited<ReturnType<typeof listPendingHours>>[number];

export default async function AdminHours({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("volunteer:hours_approve");
  const pending = await listPendingHours();

  const totalHours = pending.reduce((t, { entry }) => t + Number(entry.hours), 0);
  const volunteers = new Set(pending.map(({ entry }) => entry.personId)).size;

  const columns: Column<Row>[] = [
    {
      key: "person",
      label: "Volunteer",
      primary: true,
      render: ({ entry, personName }) => (
        <div className="min-w-0">
          <span className="font-medium">{personName ?? "Volunteer"}</span>
          <span className="block text-xs text-[var(--muted)]">
            {formatDate(entry.activityDate, locale)}
          </span>
        </div>
      ),
    },
    {
      key: "hours",
      label: "Hours",
      render: ({ entry }) => (
        <span className="font-semibold tabular-nums">{Number(entry.hours)}</span>
      ),
    },
    {
      key: "note",
      label: "Activity",
      render: ({ entry }) => (
        <span className="text-[var(--muted)]">{entry.note || "No note provided"}</span>
      ),
    },
    {
      key: "actions",
      label: "Decision",
      align: "right",
      render: ({ entry }) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ActionButton
            action={decideHours.bind(null, entry.id, "approve")}
            label="Approve"
            successMessage="Approved"
          />
          <ActionButton
            action={decideHours.bind(null, entry.id, "reject")}
            label="Reject"
            variant="danger"
            confirm="Reject these hours? The volunteer will see they were not approved."
            successMessage="Rejected"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Hours approval"
        description="Review volunteer-logged time. Approved hours count towards recognition and impact reporting."
        breadcrumb={
          <Link href="/admin/volunteers" className="hover:underline">
            ← Volunteers
          </Link>
        }
      />

      <StatGrid cols={3}>
        <StatCard
          label="Entries awaiting review"
          value={pending.length}
          icon={<Clock className="size-4" />}
        />
        <StatCard
          label="Hours pending"
          value={totalHours}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatCard
          label="Volunteers affected"
          value={volunteers}
          icon={<Users className="size-4" />}
          tone="neutral"
        />
      </StatGrid>

      <div className="mt-6">
        {pending.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-5" aria-hidden />}
            title="No hours awaiting approval"
            description="You're all caught up. New submissions from volunteers will appear here."
          />
        ) : (
          <DataList
            columns={columns}
            rows={pending}
            getKey={({ entry }) => entry.id}
            caption="Volunteer hours awaiting approval"
          />
        )}
      </div>
    </>
  );
}
