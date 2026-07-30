import { setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard, FormRow } from "@/components/ui/form";
import { DataList, type Column } from "@/components/ui/data-list";
import { Receipt, CircleDollarSign, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { myExpenses } from "@/server/queries/ops";
import { submitExpense } from "@/server/actions/ops";
import { formatDate, formatMoney } from "@/lib/utils";

export const metadata = { title: "Expense claims", robots: { index: false } };

type Claim = Awaited<ReturnType<typeof myExpenses>>[number];

export default async function VolunteerExpenses({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const expenses = await myExpenses(user.personId);

  async function submit(fd: FormData) {
    "use server";
    await submitExpense(fd);
    revalidatePath("/volunteer-portal/expenses");
  }

  const pending = expenses.filter((e) => e.status === "submitted");
  const reimbursed = expenses.filter((e) => e.status === "paid");
  const sum = (rows: Claim[]) => rows.reduce((t, e) => t + e.amountCents, 0);

  const columns: Column<Claim>[] = [
    {
      key: "amount",
      label: "Amount",
      primary: true,
      render: (e) => (
        <span className="font-semibold tabular-nums">
          {formatMoney(e.amountCents, e.currency, locale)}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (e) => <span className="capitalize">{e.category ?? "—"}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (e) => (
        <span className="text-[var(--muted)]">{e.description || "No description"}</span>
      ),
    },
    {
      key: "date",
      label: "Submitted",
      render: (e) => formatDate(e.createdAt, locale),
    },
    {
      key: "status",
      label: "Status",
      align: "right",
      render: (e) => <StatusBadge status={e.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Expense claims"
        description="Claim out-of-pocket costs such as transport or materials. 24Asia reimburses approved claims — volunteers should never be out of pocket."
      />

      <StatGrid cols={3}>
        <StatCard
          label="Awaiting review"
          value={formatMoney(sum(pending), "SGD", locale)}
          hint={`${pending.length} claim${pending.length === 1 ? "" : "s"}`}
          icon={<Clock className="size-4" />}
          tone="accent"
        />
        <StatCard
          label="Reimbursed"
          value={formatMoney(sum(reimbursed), "SGD", locale)}
          hint={`${reimbursed.length} paid`}
          icon={<CircleDollarSign className="size-4" />}
          tone="accent"
        />
        <StatCard
          label="Total claims"
          value={expenses.length}
          icon={<Receipt className="size-4" />}
          tone="accent"
        />
      </StatGrid>

      <div className="mt-6 space-y-6">
        <FormCard
          title="Submit a claim"
          description="Keep your receipts — finance may ask for them before reimbursing."
          action={submit}
          submitLabel="Submit claim"
          pendingLabel="Submitting…"
        >
          <Field label="Amount (SGD)" htmlFor="amount" required>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select id="category" name="category" defaultValue="transport">
              <option value="transport">Transport</option>
              <option value="materials">Materials</option>
              <option value="food">Food &amp; refreshments</option>
              <option value="communications">Phone &amp; data</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <FormRow>
            <Field
              label="Description"
              htmlFor="description"
              hint="What the cost was for, and which activity or event it relates to."
            >
              <Textarea id="description" name="description" rows={3} />
            </Field>
          </FormRow>
        </FormCard>

        <section>
          <SectionHeader title="Your claims" />
          {expenses.length === 0 ? (
            <EmptyState
              compact
              icon={<Receipt className="size-5" aria-hidden />}
              title="No claims yet"
              description="Submit your first claim using the form above and track its status here."
            />
          ) : (
            <DataList
              columns={columns}
              rows={expenses}
              getKey={(e) => e.id}
              caption="Your submitted expense claims"
            />
          )}
        </section>
      </div>
    </>
  );
}
