import { setRequestLocale } from "next-intl/server";
import { requirePermission, getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { TruncationNotice } from "@/components/ui/truncation-notice";
import { ActionButton } from "@/components/admin/row-actions";
import { listDonations, listOrders, getFinanceTotals } from "@/server/queries/admin";
import { refundDonation, setOrderStatus } from "@/server/actions/finance";
import { formatDate, formatMoney } from "@/lib/utils";
import { Wallet, HandCoins, ShoppingBag, Package } from "lucide-react";

type DonationRow = Awaited<ReturnType<typeof listDonations>>[number];
type OrderRow = Awaited<ReturnType<typeof listOrders>>[number];

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

  const completedGifts = donations.filter((d) => d.status === "completed").length;
  const pendingOrders = orders.filter((o) =>
    ["submitted", "awaiting_payment", "confirmed"].includes(o.status),
  ).length;

  const donationColumns: Column<DonationRow>[] = [
    {
      key: "amount",
      label: "Amount",
      primary: true,
      render: (d) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold tabular-nums">
            {formatMoney(d.amountCents, d.currency, locale)}
          </span>
          {d.anonymous && <Badge>Anonymous</Badge>}
        </span>
      ),
    },
    { key: "status", label: "Status", render: (d) => <StatusBadge status={d.status} /> },
    {
      key: "ref",
      label: "Reference",
      hideOnMobile: true,
      render: (d) => (
        <span className="font-mono text-xs text-[var(--muted)]">
          {d.providerReference ? d.providerReference.slice(0, 18) : "—"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Received",
      render: (d) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatDate(d.createdAt, locale, { dateStyle: "medium" })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (d) =>
        canRefund && d.status === "completed" ? (
          <ActionButton
            action={refundDonation.bind(null, d.id)}
            label="Refund"
            variant="danger"
            confirmTitle="Refund this donation?"
            confirm={`${formatMoney(d.amountCents, d.currency, locale)} will be returned to the donor and the gift marked refunded. This is recorded against your name.`}
            successMessage="Donation refunded"
          />
        ) : (
          <span className="text-xs text-[var(--muted)]">—</span>
        ),
    },
  ];

  const orderColumns: Column<OrderRow>[] = [
    {
      key: "total",
      label: "Order",
      primary: true,
      render: (o) => (
        <span className="font-semibold tabular-nums">
          {formatMoney(o.totalCents, o.currency, locale)}
        </span>
      ),
    },
    { key: "status", label: "Status", render: (o) => <StatusBadge status={o.status} /> },
    {
      key: "fulfilment",
      label: "Fulfilment",
      render: (o) => <Badge>{o.fulfilment}</Badge>,
    },
    {
      key: "date",
      label: "Placed",
      render: (o) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatDate(o.createdAt, locale, { dateStyle: "medium" })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (o) =>
        ["confirmed", "submitted"].includes(o.status) ? (
          <ActionButton
            action={setOrderStatus.bind(null, o.id, "fulfilled")}
            label="Mark fulfilled"
            variant="outline"
            successMessage="Order marked fulfilled"
          />
        ) : (
          <span className="text-xs text-[var(--muted)]">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Finance"
        description="Donations and merchandise orders. Card details never touch this platform — payments are handled by the hosted provider."
      />

      <StatGrid>
        <StatCard
          label="Donations received"
          value={formatMoney(totals.donatedCents, "SGD", locale, true)}
          icon={<Wallet className="size-4" />}
        />
        <StatCard label="Completed gifts" value={completedGifts} icon={<HandCoins className="size-4" />} />
        <StatCard label="Shop orders" value={orders.length} icon={<ShoppingBag className="size-4" />} />
        <StatCard
          label="Orders to fulfil"
          value={pendingOrders}
          icon={<Package className="size-4" />}
          tone={pendingOrders > 0 ? "accent" : "neutral"}
        />
      </StatGrid>

      <section className="mt-8">
        <SectionHeader
          title={`Donations (${donations.length})`}
          description={canRefund ? undefined : "Refunds require the finance approver role."}
        />
        {donations.length === 0 ? (
          <EmptyState
            icon={<Wallet className="size-5" aria-hidden />}
            title="No donations yet"
            description="Gifts appear here as soon as the payment provider confirms them."
          />
        ) : (
          <>
            <DataList columns={donationColumns} rows={donations} getKey={(d) => d.id} caption="Donations" />
            <TruncationNotice count={donations.length} limit={200} what="donations" />
          </>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader title={`Shop orders (${orders.length})`} />
        {orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" aria-hidden />}
            title="No orders yet"
            description="Merchandise orders will appear here."
          />
        ) : (
          <>
            <DataList columns={orderColumns} rows={orders} getKey={(o) => o.id} caption="Shop orders" />
            <TruncationNotice count={orders.length} limit={200} what="orders" />
          </>
        )}
      </section>
    </>
  );
}
