import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState, Stat } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import {
  listDonations,
  listOrders,
  getFinanceTotals,
} from "@/server/queries/admin";
import { refundDonation, setOrderStatus } from "@/server/actions/finance";
import { formatDate } from "@/lib/utils";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminFinance({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("donation:manage");
  const user = await getCurrentUser();
  const canRefund = user ? can(user.roles, "refund:approve") : false;

  const [donations, orders, totals] = await Promise.all([
    listDonations(),
    listOrders(),
    getFinanceTotals(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Finance</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat value={`S$${(totals.donatedCents / 100).toFixed(0)}`} label="Donations received" />
        <Stat value={String(donations.length)} label="Donation records" />
        <Stat value={String(orders.length)} label="Shop orders" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Donations</h2>
        {donations.length === 0 ? (
          <EmptyState title="No donations yet" />
        ) : (
          <div className="space-y-2">
            {donations.map((d) => (
              <Card key={d.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      S${(d.amountCents / 100).toFixed(2)}{" "}
                      {d.anonymous && <span className="text-xs text-[var(--muted)]">(anonymous)</span>}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatDate(d.createdAt, locale, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={d.status === "completed" ? "success" : d.status === "refunded" ? "danger" : "neutral"}>
                      {d.status}
                    </Badge>
                    {canRefund && d.status === "completed" && (
                      <ActionButton
                        action={refundDonation.bind(null, d.id)}
                        label="Refund"
                        variant="danger"
                        confirm="Refund this donation?"
                        successMessage="Refunded"
                      />
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Shop orders</h2>
        {orders.length === 0 ? (
          <EmptyState title="No orders yet" />
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">S${(o.totalCents / 100).toFixed(2)}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {o.fulfilment} · {formatDate(o.createdAt, locale, { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{o.status.replace(/_/g, " ")}</Badge>
                    {(o.status === "confirmed" || o.status === "submitted") && (
                      <ActionButton
                        action={setOrderStatus.bind(null, o.id, "fulfilled")}
                        label="Mark fulfilled"
                        variant="outline"
                        successMessage="Fulfilled"
                      />
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
