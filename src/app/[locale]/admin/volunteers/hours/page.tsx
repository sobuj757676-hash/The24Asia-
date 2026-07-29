import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listPendingHours } from "@/server/queries/admin";
import { decideHours } from "@/server/actions/volunteering";
import { formatDate } from "@/lib/utils";

export default async function AdminHours({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("volunteer:hours_approve");
  const pending = await listPendingHours();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Hours approval</h1>
        <Link href="/admin/volunteers" className="text-sm text-brand-700">← Volunteers</Link>
      </div>
      {pending.length === 0 ? (
        <EmptyState title="No hours awaiting approval" />
      ) : (
        <div className="space-y-2">
          {pending.map(({ entry, personName }) => (
            <Card key={entry.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {Number(entry.hours)} hours · {personName ?? "Volunteer"}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {formatDate(entry.activityDate, locale)}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ActionButton action={decideHours.bind(null, entry.id, "approve")} label="Approve" successMessage="Approved" />
                  <ActionButton action={decideHours.bind(null, entry.id, "reject")} label="Reject" variant="danger" confirm="Reject these hours?" successMessage="Rejected" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
