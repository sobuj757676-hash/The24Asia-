import { setRequestLocale } from "next-intl/server";
import dynamic from "next/dynamic";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { getReportMetrics } from "@/server/queries/admin";
import { formatMoney } from "@/lib/utils";
import {
  ClipboardList, CheckCircle2, GraduationCap, Award,
  HandHeart, Clock, Wallet, FileText, Info,
} from "lucide-react";

const FunnelChart = dynamic(() =>
  import("@/components/admin/funnel-chart").then((m) => m.FunnelChart),
);

/** Small accessible progress bar used for rate metrics. */
function RateBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-[var(--muted)]">{value}%</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-[width]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export default async function AdminReports({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("audit:read");
  const m = await getReportMetrics();

  const conversion =
    m.programs.apps > 0 ? Math.round((m.programs.enrolled / m.programs.apps) * 100) : 0;
  const completion =
    m.programs.enrolled > 0
      ? Math.round((m.programs.completed / m.programs.enrolled) * 100)
      : 0;

  const funnel = [
    { stage: "Applied", value: m.programs.apps },
    { stage: "Approved", value: m.programs.approvedApps },
    { stage: "Enrolled", value: m.programs.enrolled },
    { stage: "Completed", value: m.programs.completed },
  ];

  return (
    <>
      <PageHeader
        title="Reports & impact"
        description="Operational metrics computed live from records. Public impact figures are managed separately with their own definitions and sources."
      />

      <SectionHeader title="Learning" />
      <StatGrid>
        <StatCard label="Applications" value={m.programs.apps} icon={<ClipboardList className="size-4" />} />
        <StatCard label="Approved" value={m.programs.approvedApps} icon={<CheckCircle2 className="size-4" />} />
        <StatCard label="Enrolled" value={m.programs.enrolled} icon={<GraduationCap className="size-4" />} />
        <StatCard label="Completed" value={m.programs.completed} icon={<Award className="size-4" />} />
      </StatGrid>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardBody>
            <SectionHeader title="Funnel" description="Application through to completion." />
            <FunnelChart data={funnel} />
            <table className="mt-2 w-full text-sm">
              <caption className="sr-only">Learning funnel counts by stage</caption>
              <tbody>
                {funnel.map((f) => (
                  <tr key={f.stage} className="border-t">
                    <th scope="row" className="py-1.5 text-left font-medium">{f.stage}</th>
                    <td className="py-1.5 text-right tabular-nums">{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody className="space-y-5">
            <SectionHeader title="Key rates" />
            <RateBar label="Attendance rate" value={m.attendance.rate} />
            <RateBar label="Application → enrolment" value={conversion} />
            <RateBar label="Enrolment → completion" value={completion} />
            <p className="text-xs text-[var(--muted)]">
              Based on {m.attendance.totalMarks} attendance marks recorded.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <SectionHeader title="Volunteering" />
        <StatGrid cols={3}>
          <StatCard label="Applications" value={m.volunteers.volApps} icon={<ClipboardList className="size-4" />} tone="accent" />
          <StatCard label="Active volunteers" value={m.volunteers.activeVols} icon={<HandHeart className="size-4" />} tone="accent" />
          <StatCard label="Approved hours" value={m.volunteers.approvedHours} icon={<Clock className="size-4" />} tone="accent" />
        </StatGrid>
      </div>

      <div className="mt-8">
        <SectionHeader title="Fundraising & content" />
        <StatGrid>
          <StatCard
            label="Donations"
            value={formatMoney(m.donations.donatedCents, "SGD", locale, true)}
            icon={<Wallet className="size-4" />}
          />
          <StatCard label="Gifts received" value={m.donations.donationCount} icon={<Wallet className="size-4" />} />
          <StatCard label="Published courses" value={m.content.publishedCourses} icon={<GraduationCap className="size-4" />} />
          <StatCard label="Published content" value={m.content.publishedContent} icon={<FileText className="size-4" />} />
        </StatGrid>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm dark:border-sky-800 dark:bg-sky-900/20">
        <Info className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden />
        <p>
          Breakdowns by nationality or language are deliberately omitted to avoid stigmatising
          groups, and any published breakdown suppresses small cohorts.
        </p>
      </div>
    </>
  );
}
