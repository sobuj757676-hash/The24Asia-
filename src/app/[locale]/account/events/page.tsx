import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { getMyEventRegistrations } from "@/server/queries/portal";
import { cancelEventRegistration } from "@/server/actions/learner";
import { formatDate } from "@/lib/utils";

export default async function MyEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const regs = await getMyEventRegistrations(user.personId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t("myEvents")}</h1>
      {regs.length === 0 ? (
        <EmptyState title={t("noData")} />
      ) : (
        regs.map(({ registration, event }) => (
          <Card key={registration.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{event.title}</CardTitle>
                <p className="text-sm text-[var(--muted)]">
                  {formatDate(event.startsAt, locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  · {event.locationName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{registration.status.replace(/_/g, " ")}</Badge>
                {(registration.status === "registered" || registration.status === "waitlisted") && (
                  <ActionButton
                    action={cancelEventRegistration.bind(null, registration.id, undefined)}
                    label="Cancel"
                    variant="ghost"
                    confirm="Cancel this registration?"
                    successMessage="Cancelled"
                  />
                )}
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
