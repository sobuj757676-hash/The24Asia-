import { setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { myExpenses } from "@/server/queries/ops";
import { submitExpense } from "@/server/actions/ops";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Expense claims</h1>
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">Submit a claim</h2>
          <form action={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount (SGD)" htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
            </Field>
            <Field label="Category" htmlFor="category">
              <Input id="category" name="category" placeholder="transport / materials" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" />
              </Field>
            </div>
            <div className="sm:col-span-2"><Button type="submit">Submit claim</Button></div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <EmptyState title="No claims yet" />
        ) : (
          expenses.map((e) => (
            <Card key={e.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">S${(e.amountCents / 100).toFixed(2)}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {e.category} · {formatDate(e.createdAt, locale)}
                  </p>
                </div>
                <Badge tone={e.status === "approved" || e.status === "paid" ? "success" : e.status === "rejected" ? "danger" : "neutral"}>
                  {e.status}
                </Badge>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
