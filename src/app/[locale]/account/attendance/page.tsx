import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { requireUser } from "@/lib/auth/session";
import { getMyAttendance } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";
import { ClipboardCheck, CheckCircle2, Percent } from "lucide-react";

const PRESENT = ["present", "checked_in", "late"];

type Row = Awaited<ReturnType<typeof getMyAttendance>>[number];

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

  const attended = rows.filter((r) => PRESENT.includes(r.attendance.status)).length;
  const rate = rows.length > 0 ? Math.round((attended / rows.length) * 100) : 0;

  const columns: Column<Row>[] = [
    {
      key: "course",
      label: "Course",
      primary: true,
      render: (r) => (
        <span className="flex flex-col">
          <span className="font-medium">{r.courseTitle}</span>
          <span className="text-xs text-[var(--muted)]">{r.sessionTitle ?? "Session"}</span>
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatDate(r.startsAt, locale, { dateStyle: "medium", timeStyle: "short" })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Attendance",
      align: "right",
      render: (r) => <StatusBadge status={r.attendance.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("attendanceRecord")}
        description="Your attendance is recorded by your trainer at each session. If something looks wrong, tell your trainer — corrections are logged."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="size-5" aria-hidden />}
          title="No attendance recorded yet"
          description="Your record appears here after your first session."
        />
      ) : (
        <>
          <StatGrid cols={3}>
            <StatCard label="Sessions" value={rows.length} icon={<ClipboardCheck className="size-4" />} />
            <StatCard label="Attended" value={attended} icon={<CheckCircle2 className="size-4" />} />
            <StatCard label="Attendance rate" value={`${rate}%`} icon={<Percent className="size-4" />} />
          </StatGrid>

          <div className="mt-6">
            <DataList
              columns={columns}
              rows={rows}
              getKey={(r) => r.attendance.id}
              caption="Your attendance record"
            />
          </div>
        </>
      )}
    </>
  );
}
