import { setRequestLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { FormCard, FormRow } from "@/components/ui/form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { requireUser } from "@/lib/auth/session";
import { getMyHours } from "@/server/queries/portal";
import { logHours } from "@/server/actions/volunteering";
import { formatDate } from "@/lib/utils";
import { Clock, CheckCircle2, Hourglass } from "lucide-react";

type Row = Awaited<ReturnType<typeof getMyHours>>[number];

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

  const approved = hours.filter((h) => h.approved);
  const pending = hours.filter((h) => !h.approved);
  const approvedTotal = approved.reduce((s, h) => s + Number(h.hours), 0);
  const pendingTotal = pending.reduce((s, h) => s + Number(h.hours), 0);

  async function save(fd: FormData) {
    "use server";
    await logHours(fd);
    revalidatePath("/volunteer-portal/hours");
  }

  const today = new Date().toISOString().slice(0, 10);

  const columns: Column<Row>[] = [
    {
      key: "hours",
      label: "Hours",
      primary: true,
      render: (h) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold tabular-nums">{Number(h.hours)} hours</span>
          <Badge tone={h.approved ? "success" : "warning"}>
            {h.approved ? "Approved" : "Pending"}
          </Badge>
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (h) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatDate(h.activityDate, locale, { dateStyle: "medium" })}
        </span>
      ),
    },
    {
      key: "note",
      label: "Activity",
      render: (h) => <span className="text-[var(--muted)]">{h.note ?? "—"}</span>,
    },
    {
      key: "approved",
      label: "Approved on",
      align: "right",
      hideOnMobile: true,
      render: (h) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {h.approvedAt ? formatDate(h.approvedAt, locale, { dateStyle: "medium" }) : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("myHours")}
        description="Log the time you give. A coordinator approves it, and approved hours count towards your recognition milestones."
      />

      <StatGrid cols={3}>
        <StatCard
          label="Approved hours"
          value={approvedTotal}
          icon={<CheckCircle2 className="size-4" />}
          tone="accent"
        />
        <StatCard
          label="Awaiting approval"
          value={pendingTotal}
          hint={pending.length > 0 ? `${pending.length} entr${pending.length === 1 ? "y" : "ies"}` : undefined}
          icon={<Hourglass className="size-4" />}
          tone="accent"
        />
        <StatCard label="Entries logged" value={hours.length} icon={<Clock className="size-4" />} tone="accent" />
      </StatGrid>

      <div className="mt-8">
        <FormCard
          title="Log hours"
          description="Record time as soon as you can — it's easier to remember the details."
          action={save}
          submitLabel="Submit for approval"
          pendingLabel="Submitting…"
        >
          <Field label="Hours" htmlFor="hours" required hint="Use 1.5 for an hour and a half">
            <Input id="hours" name="hours" type="number" step="0.5" min="0.5" max="24" required />
          </Field>
          <Field label="Date" htmlFor="activityDate" required>
            <Input id="activityDate" name="activityDate" type="date" max={today} required />
          </Field>
          <FormRow>
            <Field label="What did you do?" htmlFor="note" hint="Helps your coordinator approve it quickly">
              <Textarea id="note" name="note" placeholder="e.g. Assisted the weekend Excel class" />
            </Field>
          </FormRow>
        </FormCard>
      </div>

      <section className="mt-8">
        <SectionHeader title={`My log (${hours.length})`} />
        {hours.length === 0 ? (
          <EmptyState
            icon={<Clock className="size-5" aria-hidden />}
            title="No hours logged yet"
            description="Use the form above to record the time you've given."
          />
        ) : (
          <DataList columns={columns} rows={hours} getKey={(h) => h.id} caption="My volunteer hours" />
        )}
      </section>
    </>
  );
}
