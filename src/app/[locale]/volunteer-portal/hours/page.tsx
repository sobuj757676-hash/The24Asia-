import { getTranslations, setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { getMyHours } from "@/server/queries/portal";
import { logHours } from "@/server/actions/volunteering";
import { formatDate } from "@/lib/utils";

export default async function HoursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const hours = await getMyHours(user.personId);

  async function save(formData: FormData) {
    "use server";
    await logHours(formData);
    revalidatePath("/volunteer-portal/hours");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t("myHours")}</h1>

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">Log hours</h2>
          <form action={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Hours" htmlFor="hours" required>
              <Input
                id="hours"
                name="hours"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                required
              />
            </Field>
            <Field label="Date" htmlFor="activityDate" required>
              <Input id="activityDate" name="activityDate" type="date" required />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Note (optional)" htmlFor="note">
                <Textarea id="note" name="note" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Submit for approval</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {hours.length === 0 ? (
          <EmptyState title={t("noData")} />
        ) : (
          hours.map((h) => (
            <Card key={h.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{Number(h.hours)} hours</p>
                  <p className="text-sm text-[var(--muted)]">
                    {formatDate(h.activityDate, locale)}
                    {h.note ? ` · ${h.note}` : ""}
                  </p>
                </div>
                <Badge tone={h.approved ? "success" : "warning"}>
                  {h.approved ? "Approved" : "Pending"}
                </Badge>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
