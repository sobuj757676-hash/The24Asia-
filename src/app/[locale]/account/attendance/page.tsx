import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { getMyAttendance } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";

const TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  present: "success",
  checked_in: "success",
  late: "warning",
  excused: "neutral",
  no_show: "danger",
  expected: "neutral",
  corrected: "neutral",
};

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const rows = await getMyAttendance(user.personId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t("attendanceRecord")}</h1>
      {rows.length === 0 ? (
        <EmptyState title={t("noData")} body="Your attendance will appear here after your first session." />
      ) : (
        rows.map(({ attendance, sessionTitle, startsAt, courseTitle }) => (
          <Card key={attendance.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{courseTitle}</p>
                <p className="text-sm text-[var(--muted)]">
                  {sessionTitle ?? "Session"} · {formatDate(startsAt, locale, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <Badge tone={TONE[attendance.status] ?? "neutral"}>
                {attendance.status.replace(/_/g, " ")}
              </Badge>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
