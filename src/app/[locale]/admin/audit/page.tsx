import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataList, type Column } from "@/components/ui/data-list";
import { getRecentAudit } from "@/server/queries/admin";
import { formatDate } from "@/lib/utils";
import { ScrollText } from "lucide-react";

type Row = Awaited<ReturnType<typeof getRecentAudit>>[number];

export default async function AdminAudit({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("audit:read");
  const events = await getRecentAudit();

  const columns: Column<Row>[] = [
    {
      key: "action",
      label: "Action",
      primary: true,
      render: (e) => <span className="font-mono text-xs">{e.action}</span>,
    },
    {
      key: "object",
      label: "Object",
      render: (e) => <span className="text-[var(--muted)]">{e.objectType}</span>,
    },
    {
      key: "outcome",
      label: "Outcome",
      render: (e) => <StatusBadge status={e.outcome} />,
    },
    {
      key: "time",
      label: "When",
      align: "right",
      render: (e) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatDate(e.occurredAt, locale, { dateStyle: "short", timeStyle: "short" })}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Append-only record of sensitive actions. Tokens, secrets and record contents are never stored here."
      />
      {events.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-5" aria-hidden />}
          title="No audit events yet"
          description="Actions such as approvals, publications and role changes will be recorded here."
        />
      ) : (
        <DataList
          columns={columns}
          rows={events}
          getKey={(e) => e.id}
          caption="Recent audit events"
        />
      )}
    </>
  );
}
