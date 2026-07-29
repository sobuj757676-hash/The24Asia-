import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/row-actions";
import {
  getAllEvents,
  getEventRegistrationCounts,
  getById,
} from "@/server/queries/admin";
import { saveEvent, deleteEvent } from "@/server/actions/manage";
import { formatDate } from "@/lib/utils";

function toLocalInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

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

  const events = await getAllEvents();
  const editing = await getById(events, edit);
  const counts = await Promise.all(
    events.map(async (e) => ({ id: e.id, n: await getEventRegistrationCounts(e.id) })),
  );
  const countMap = new Map(counts.map((c) => [c.id, c.n]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Events</h1>

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">{editing ? "Edit event" : "New event"}</h2>
          <form action={saveEvent} className="grid gap-4 sm:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" defaultValue={editing?.title} required />
            </Field>
            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" defaultValue={editing?.category ?? "education"}>
                {["education","blood_donation","environment","sport","culture","entertainment","team_building","volunteer_only","partner"].map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </Select>
            </Field>
            <Field label="Starts at" htmlFor="startsAt" required>
              <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocalInput(editing?.startsAt)} required />
            </Field>
            <Field label="Ends at" htmlFor="endsAt">
              <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocalInput(editing?.endsAt)} />
            </Field>
            <Field label="Location" htmlFor="locationName">
              <Input id="locationName" name="locationName" defaultValue={editing?.locationName ?? ""} />
            </Field>
            <Field label="Capacity" htmlFor="capacity">
              <Input id="capacity" name="capacity" type="number" defaultValue={editing?.capacity ?? ""} />
            </Field>
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue={editing?.status ?? "draft"}>
                {["draft","published","registration_open","registration_closed","in_progress","completed","cancelled"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="What to bring" htmlFor="whatToBring">
                <Input id="whatToBring" name="whatToBring" defaultValue={editing?.whatToBring ?? ""} />
              </Field>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">{editing ? "Save" : "Create event"}</Button>
              {editing && <Button asChild variant="ghost"><Link href="/admin/events">Cancel</Link></Button>}
            </div>
          </form>
        </CardBody>
      </Card>

      {events.length === 0 ? (
        <EmptyState title="No events yet" />
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <Card key={e.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{e.title}</CardTitle>
                  <p className="text-sm text-[var(--muted)]">
                    {formatDate(e.startsAt, locale, { dateStyle: "medium", timeStyle: "short" })} · {e.locationName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">{countMap.get(e.id) ?? 0} registered</span>
                  <Badge>{e.status.replace(/_/g, " ")}</Badge>
                  <Button asChild size="sm" variant="outline"><Link href={`/admin/events/${e.id}`}>Roster</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href={`/admin/events?edit=${e.id}`}>Edit</Link></Button>
                  <ActionButton action={deleteEvent.bind(null, e.id)} label="Delete" variant="danger" icon confirm={`Delete "${e.title}"?`} successMessage="Deleted" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
