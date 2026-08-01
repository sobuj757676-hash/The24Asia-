import { setRequestLocale } from "next-intl/server";
import { BackLink } from "@/components/ui/nav-link";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { Receipt, Clock, CircleDollarSign } from "lucide-react";
import { ActionButton } from "@/components/admin/row-actions";
import { listAllExpenses } from "@/server/queries/ops";
import { decideExpense } from "@/server/actions/ops";
import { formatDate, formatMoney } from "@/lib/utils";

type Row = Awaited<ReturnType<typeof listAllExpenses>>[number];

export default async function AdminExpenses({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("volunteer:hours_approve");
  const expenses = await listAllExpenses();

  const submitted = expenses.filter((e) => e.claim.status === "submitted");
  const approved = expenses.filter((e) => e.claim.status === "approved");
  const sum = (rows: Row[]) => rows.reduce((t, { claim }) => t + claim.amountCents, 0);

  const columns: Column<Row>[] = [
    {
      key: "person",
      label: "Volunteer",
      primary: true,
      render: ({ claim, personName }) => (
        <div className="min-w-0">
          <span className="font-medium">{personName ?? "Volunteer"}</span>
          <span className="block text-xs text-[var(--muted)]">
            {formatDate(claim.createdAt, locale)}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: ({ claim }) => (
        <span className="font-semibold tabular-nums">
          {formatMoney(claim.amountCents, claim.currency, locale)}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: ({ claim }) => <span className="capitalize">{claim.category ?? "—"}</span>,
    },
    {
      key: "description",
      label: "Description",
      hideOnMobile: true,
      render: ({ claim }) => (
        <span className="text-[var(--muted)]">{claim.description || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: ({ claim }) => <StatusBadge status={claim.status} />,
    },
    {
      key: "actions",
      label: "Decision",
      align: "right",
      render: ({ claim }) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {claim.status === "submitted" && (
            <>
              <ActionButton
                action={decideExpense.bind(null, claim.id, "approved")}
                label="Approve"
                successMessage="Approved"
              />
              <ActionButton
                action={decideExpense.bind(null, claim.id, "rejected")}
                label="Reject"
                variant="danger"
                confirm="Reject this claim? The volunteer will see it was not approved."
                successMessage="Rejected"
              />
            </>
          )}
          {claim.status === "approved" && (
            <ActionButton
              action={decideExpense.bind(null, claim.id, "paid")}
              label="Mark paid"
              variant="outline"
              confirm="Confirm this claim has been reimbursed?"
              successMessage="Marked paid"
            />
          )}
          {(claim.status === "paid" || claim.status === "rejected") && (
            <span className="text-xs text-[var(--muted)]">No action needed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Expense claims"
        description="Reimburse volunteers promptly — nobody should be out of pocket for giving their time."
        breadcrumb={
          <BackLink href="/admin/volunteers">Volunteers</BackLink>
        }
      />

      <StatGrid cols={3}>
        <StatCard
          label="Awaiting review"
          value={formatMoney(sum(submitted), "SGD", locale)}
          hint={`${submitted.length} claim${submitted.length === 1 ? "" : "s"}`}
          icon={<Clock className="size-4" />}
        />
        <StatCard
          label="Approved, not yet paid"
          value={formatMoney(sum(approved), "SGD", locale)}
          hint={`${approved.length} to reimburse`}
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          label="Total claims"
          value={expenses.length}
          icon={<Receipt className="size-4" />}
          tone="neutral"
        />
      </StatGrid>

      <div className="mt-6">
        {expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-5" aria-hidden />}
            title="No expense claims"
            description="Claims submitted by volunteers from their portal will appear here for approval."
          />
        ) : (
          <DataList
            columns={columns}
            rows={expenses}
            getKey={({ claim }) => claim.id}
            caption="Volunteer expense claims"
          />
        )}
      </div>
    </>
  );
}
