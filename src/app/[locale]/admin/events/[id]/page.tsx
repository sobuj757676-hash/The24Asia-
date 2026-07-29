import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState, Stat } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { getEventRoster } from "@/server/queries/admin";
import { checkInAttendee } from "@/server/actions/attendance";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{data.event.title}</h1>
          <p className="text-[var(--muted)]">
            {formatDate(data.event.startsAt, locale, { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <Link href="/admin/events" className="text-sm text-brand-700">← Events</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat value={String(data.registrations.length)} label="Registered" />
        <Stat value={String(checkedIn)} label="Checked in" />
        <Stat value={String(data.registrations.reduce((s, r) => s + r.reg.guests, 0))} label="Guests" />
      </div>

      {data.registrations.length === 0 ? (
        <EmptyState title="No registrations yet" />
      ) : (
        <div className="space-y-2">
          {data.registrations.map(({ reg, name }) => (
            <Card key={reg.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{name ?? "Attendee"}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {reg.guests > 0 ? `+${reg.guests} guest(s) · ` : ""}
                    {reg.allowPhoto ? "photo OK" : "no photos"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={reg.status === "checked_in" || reg.status === "attended" ? "success" : reg.status === "cancelled" ? "danger" : "neutral"}>
                    {reg.status.replace(/_/g, " ")}
                  </Badge>
                  {reg.status === "registered" && (
                    <ActionButton
                      action={checkInAttendee.bind(null, reg.id)}
                      label="Check in"
                      successMessage="Checked in"
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
