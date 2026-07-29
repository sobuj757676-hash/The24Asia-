import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listAllExpenses } from "@/server/queries/ops";
import { decideExpense } from "@/server/actions/ops";
import { formatDate } from "@/lib/utils";

export default async function AdminExpenses({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("volunteer:hours_approve");
  const expenses = await listAllExpenses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Expense claims</h1>
        <Link href="/admin/volunteers" className="text-sm text-brand-700">← Volunteers</Link>
      </div>
      {expenses.length === 0 ? (
        <EmptyState title="No expense claims" />
      ) : (
        <div className="space-y-2">
          {expenses.map(({ claim, personName }) => (
            <Card key={claim.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    S${(claim.amountCents / 100).toFixed(2)} · {personName ?? "Volunteer"}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {claim.category} · {claim.description} · {formatDate(claim.createdAt, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={claim.status === "approved" || claim.status === "paid" ? "success" : claim.status === "rejected" ? "danger" : "neutral"}>
                    {claim.status}
                  </Badge>
                  {claim.status === "submitted" && (
                    <>
                      <ActionButton action={decideExpense.bind(null, claim.id, "approved")} label="Approve" successMessage="Approved" />
                      <ActionButton action={decideExpense.bind(null, claim.id, "rejected")} label="Reject" variant="danger" successMessage="Rejected" />
                    </>
                  )}
                  {claim.status === "approved" && (
                    <ActionButton action={decideExpense.bind(null, claim.id, "paid")} label="Mark paid" variant="outline" successMessage="Marked paid" />
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
