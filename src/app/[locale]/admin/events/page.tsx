import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { FormCard, FormRow } from "@/components/ui/form";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { ActionButton } from "@/components/admin/row-actions";
import {
  getAllEvents,
  getEventRegistrationCountMap,
  getById,
} from "@/server/queries/admin";
import { saveEvent, deleteEvent } from "@/server/actions/manage";
import { formatDate } from "@/lib/utils";
import { CalendarDays, Users, CalendarClock } from "lucide-react";

const CATEGORIES = [
  "education", "blood_donation", "environment", "sport", "culture",
  "entertainment", "team_building", "volunteer_only", "partner",
];
const STATUSES = [
  "draft", "published", "registration_open", "registration_closed",
  "in_progress", "completed", "cancelled",
];

/** datetime-local needs a local (not UTC) value. */
function toLocalInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

type Row = Awaited<ReturnType<typeof getAllEvents>>[number];

export default async function AdminEvents({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { locale } = await params;
  const { edit } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("event:manage");

  const [events, countMap] = await Promise.all([
    getAllEvents(),
    getEventRegistrationCountMap(),
  ]);
  const editing = await getById(events, edit);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startsAt) >= now).length;
  const totalRegs = [...countMap.values()].reduce((a, b) => a + b, 0);

  const columns: Column<Row>[] = [
    {
      key: "title",
      label: "Event",
      primary: true,
      render: (e) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{e.title}</span>
          <Badge>{e.category.replace(/_/g, " ")}</Badge>
        </span>
      ),
    },
    {
      key: "when",
      label: "When",
      render: (e) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatDate(e.startsAt, locale, { dateStyle: "medium", timeStyle: "short" })}
        </span>
      ),
    },
    {
      key: "where",
      label: "Location",
      hideOnMobile: true,
      render: (e) => <span className="text-[var(--muted)]">{e.locationName ?? "—"}</span>,
    },
    {
      key: "regs",
      label: "Registered",
      render: (e) => (
        <span className="tabular-nums">
          {countMap.get(e.id) ?? 0}
          {e.capacity ? <span className="text-[var(--muted)]"> / {e.capacity}</span> : null}
        </span>
      ),
    },
    { key: "status", label: "Status", render: (e) => <StatusBadge status={e.status} /> },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (e) => (
        <span className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/events/${e.id}`}>Roster</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/admin/events?edit=${e.id}`}>Edit</Link>
          </Button>
          <ActionButton
            action={deleteEvent.bind(null, e.id)}
            label="Delete"
            variant="danger"
            icon
            confirmTitle={`Delete “${e.title}”?`}
            confirm="Registrations for this event will also be removed. This cannot be undone."
            successMessage="Event deleted"
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Events"
        description="Create events, manage capacity and check people in on the day."
      />

      <StatGrid cols={3}>
        <StatCard label="All events" value={events.length} icon={<CalendarDays className="size-4" />} />
        <StatCard label="Upcoming" value={upcoming} icon={<CalendarClock className="size-4" />} />
        <StatCard label="Total registrations" value={totalRegs} icon={<Users className="size-4" />} />
      </StatGrid>

      <div className="mt-8">
        <FormCard
          title={editing ? `Edit “${editing.title}”` : "Create an event"}
          action={saveEvent}
          submitLabel={editing ? "Save changes" : "Create event"}
          secondaryAction={
            editing ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/events">Cancel</Link>
              </Button>
            ) : null
          }
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={editing?.title} required />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select id="category" name="category" defaultValue={editing?.category ?? "education"}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Starts at" htmlFor="startsAt" required>
            <Input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toLocalInput(editing?.startsAt)}
              required
            />
          </Field>
          <Field label="Ends at" htmlFor="endsAt">
            <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocalInput(editing?.endsAt)} />
          </Field>
          <Field label="Location" htmlFor="locationName">
            <Input id="locationName" name="locationName" defaultValue={editing?.locationName ?? ""} />
          </Field>
          <Field label="Capacity" htmlFor="capacity" hint="Leave blank for unlimited">
            <Input id="capacity" name="capacity" type="number" min="1" defaultValue={editing?.capacity ?? ""} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={editing?.status ?? "draft"}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Map link" htmlFor="mapUrl">
            <Input id="mapUrl" name="mapUrl" type="url" defaultValue={editing?.mapUrl ?? ""} placeholder="https://…" />
          </Field>
          <FormRow>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="What to bring" htmlFor="whatToBring">
              <Input id="whatToBring" name="whatToBring" defaultValue={editing?.whatToBring ?? ""} />
            </Field>
          </FormRow>
        </FormCard>
      </div>

      <section className="mt-8">
        <SectionHeader title={`All events (${events.length})`} />
        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-5" aria-hidden />}
            title="No events yet"
            description="Create your first event — blood drives, cleanups, celebrations and more."
          />
        ) : (
          <DataList columns={columns} rows={events} getKey={(e) => e.id} caption="Events" />
        )}
      </section>
    </>
  );
}
