import { getTranslations, setRequestLocale } from "next-intl/server";
import { Stat } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { getAdminKpis, getPendingApplications } from "@/server/queries/admin";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [kpis, pending] = await Promise.all([
    getAdminKpis(),
    getPendingApplications(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t("overview")}</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={String(kpis.people)} label="People" />
        <Stat value={String(kpis.activeEnrollments)} label={t("kpiActiveStudents")} />
        <Stat value={String(kpis.volunteers)} label={t("kpiVolunteers")} />
        <Stat value={String(kpis.upcomingEvents)} label={t("kpiUpcomingEvents")} />
      </div>

      <Card>
        <CardBody>
          <CardTitle className="text-base">Actionable queue</CardTitle>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {pending.length} course application(s) awaiting review.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
