import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { getMyShifts } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";

export default async function ShiftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const shifts = await getMyShifts(user.personId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t("myShifts")}</h1>
      {shifts.length === 0 ? (
        <EmptyState title={t("noData")} />
      ) : (
        shifts.map(({ shift, event }) => (
          <Card key={shift.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  {event?.title ?? shift.role ?? "Shift"}
                </CardTitle>
                <p className="text-sm text-[var(--muted)]">
                  {shift.startsAt ? formatDate(shift.startsAt, locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }) : "Time TBA"}
                </p>
              </div>
              <Badge>{shift.status.replace(/_/g, " ")}</Badge>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
