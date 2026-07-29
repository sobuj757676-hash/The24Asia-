import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { getMyShifts, getUpcomingEventsForSignup } from "@/server/queries/portal";
import { signUpForShift, cancelShift } from "@/server/actions/volunteering";
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
  const [shifts, available] = await Promise.all([
    getMyShifts(user.personId),
    getUpcomingEventsForSignup(user.personId),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-3 text-2xl font-extrabold">{t("myShifts")}</h1>
        {shifts.length === 0 ? (
          <EmptyState title={t("noData")} />
        ) : (
          <div className="space-y-2">
            {shifts.map(({ shift, event }) => (
              <Card key={shift.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {event?.title ?? shift.role ?? "Shift"}
                    </CardTitle>
                    <p className="text-sm text-[var(--muted)]">
                      {shift.role} ·{" "}
                      {shift.startsAt
                        ? formatDate(shift.startsAt, locale, { dateStyle: "medium", timeStyle: "short" })
                        : "Time TBA"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={shift.status === "cancelled" ? "danger" : "brand"}>
                      {shift.status.replace(/_/g, " ")}
                    </Badge>
                    {shift.status !== "cancelled" && shift.status !== "completed" && (
                      <ActionButton
                        action={cancelShift.bind(null, shift.id)}
                        label="Cancel"
                        variant="ghost"
                        confirm="Cancel this shift?"
                        successMessage="Cancelled"
                      />
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Self-service shift sign-up (VOL-009) */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Available shifts</h2>
        {available.length === 0 ? (
          <EmptyState title="No upcoming events need volunteers right now" />
        ) : (
          <div className="space-y-2">
            {available.map((e) => (
              <Card key={e.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{e.title}</CardTitle>
                    <p className="text-sm text-[var(--muted)]">
                      {formatDate(e.startsAt, locale, { dateStyle: "medium", timeStyle: "short" })} · {e.locationName}
                    </p>
                  </div>
                  <form action={signUpForShift.bind(null, e.id)} className="flex items-end gap-2">
                    <Input name="role" placeholder="Role (e.g. crew)" className="h-10 w-40" />
                    <Button type="submit" size="sm">Sign up</Button>
                  </form>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
