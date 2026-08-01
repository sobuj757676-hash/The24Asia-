import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BackLink } from "@/components/ui/nav-link";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Badge, StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { CalendarCheck, Users, UserPlus, CameraOff } from "lucide-react";
import { ActionButton } from "@/components/admin/row-actions";
import { getEventRoster } from "@/server/queries/admin";
import { checkInAttendee } from "@/server/actions/attendance";
import { formatDate } from "@/lib/utils";

type Roster = NonNullable<Awaited<ReturnType<typeof getEventRoster>>>;
type Row = Roster["registrations"][number];

export default async function EventRoster({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requirePermission("registration:manage");
  const data = await getEventRoster(id);
  if (!data) notFound();

  const checkedIn = data.registrations.filter(
    (r) => r.reg.status === "checked_in" || r.reg.status === "attended",
  ).length;
  const guests = data.registrations.reduce((s, r) => s + r.reg.guests, 0);
  const noPhoto = data.registrations.filter((r) => !r.reg.allowPhoto).length;

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Attendee",
      primary: true,
      render: ({ reg, name }) => (
        <div className="min-w-0">
          <span className="font-medium">{name ?? "Attendee"}</span>
          {reg.guests > 0 && (
            <span className="block text-xs text-[var(--muted)]">
              +{reg.guests} guest{reg.guests === 1 ? "" : "s"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "consent",
      label: "Photo consent",
      render: ({ reg }) =>
        reg.allowPhoto ? (
          <span className="text-sm text-[var(--muted)]">Allowed</span>
        ) : (
          <Badge tone="warning">
            <CameraOff className="size-3" aria-hidden />
            Do not photograph
          </Badge>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: ({ reg }) => <StatusBadge status={reg.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: ({ reg }) =>
        reg.status === "registered" || reg.status === "waitlisted" ? (
          <ActionButton
            action={checkInAttendee.bind(null, reg.id)}
            label="Check in"
            successMessage="Checked in"
          />
        ) : (
          <span className="text-xs text-[var(--muted)]">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title={data.event.title}
        description={formatDate(data.event.startsAt, locale, {
          dateStyle: "full",
          timeStyle: "short",
        })}
        breadcrumb={
          <BackLink href="/admin/events">Events</BackLink>
        }
        actions={<StatusBadge status={data.event.status} />}
      />

      <StatGrid>
        <StatCard
          label="Registered"
          value={data.registrations.length}
          hint={data.event.capacity ? `Capacity ${data.event.capacity}` : undefined}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Checked in"
          value={checkedIn}
          hint={
            data.registrations.length > 0
              ? `${Math.round((checkedIn / data.registrations.length) * 100)}% turnout`
              : undefined
          }
          icon={<CalendarCheck className="size-4" />}
        />
        <StatCard label="Guests" value={guests} icon={<UserPlus className="size-4" />} />
        <StatCard
          label="No photo consent"
          value={noPhoto}
          hint={noPhoto > 0 ? "Brief your media team" : "All attendees consented"}
          icon={<CameraOff className="size-4" />}
          tone="neutral"
        />
      </StatGrid>

      <div className="mt-6">
        {data.registrations.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" aria-hidden />}
            title="No registrations yet"
            description="Share the event page to start taking registrations, or add attendees on the day."
          />
        ) : (
          <DataList
            columns={columns}
            rows={data.registrations}
            getKey={({ reg }) => reg.id}
            caption={`Registrations for ${data.event.title}`}
          />
        )}
      </div>
    </>
  );
}
