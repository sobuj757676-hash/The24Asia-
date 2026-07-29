import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { getMyVolunteerApplications } from "@/server/queries/portal";

export default async function VolunteerApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const apps = await getMyVolunteerApplications(user.personId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t("myApplications")}</h1>
      {apps.length === 0 ? (
        <EmptyState title={t("noData")} />
      ) : (
        apps.map(({ application, opportunity }) => (
          <Card key={application.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  {opportunity?.title ?? "General application"}
                </CardTitle>
              </div>
              <Badge
                tone={
                  application.status === "approved"
                    ? "success"
                    : application.status === "declined"
                      ? "danger"
                      : "neutral"
                }
              >
                {application.status.replace(/_/g, " ")}
              </Badge>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
