import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { getMyEventRegistrations } from "@/server/queries/portal";
import { cancelEventRegistration } from "@/server/actions/learner";
import { formatDate } from "@/lib/utils";
import { CalendarDays, MapPin, CalendarClock } from "lucide-react";

const CANCELLABLE = ["registered", "waitlisted"];

export default async function MyEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const regs = await getMyEventRegistrations(user.personId);

  const now = new Date();
  const upcoming = regs.filter((r) => new Date(r.event.startsAt) >= now);
  const past = regs.filter((r) => new Date(r.event.startsAt) < now);

  function EventRow({
    row,
    allowCancel,
  }: {
    row: (typeof regs)[number];
    allowCancel: boolean;
  }) {
    const { registration, event } = row;
    return (
      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {event.title}
              <StatusBadge status={registration.status} />
              {!registration.allowPhoto && <Badge tone="warning">No photos</Badge>}
            </p>
            <div className="mt-2 space-y-1 text-sm text-[var(--muted)]">
              <p className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                {formatDate(event.startsAt, locale, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              {event.locationName && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  {event.locationName}
                </p>
              )}
            </div>
            {event.whatToBring && (
              <p className="mt-2 rounded-xl bg-brand-50 p-2.5 text-sm dark:bg-brand-900/20">
                <span className="font-medium">Bring: </span>
                {event.whatToBring}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/events/${event.slug}`}>Details</Link>
            </Button>
            {allowCancel && CANCELLABLE.includes(registration.status) && (
              <ActionButton
                action={cancelEventRegistration.bind(null, registration.id, undefined)}
                label="Cancel"
                variant="ghost"
                confirmTitle={`Cancel your place at ${event.title}?`}
                confirm="Your place will be offered to someone else. Please cancel early if you can't make it."
                successMessage="Registration cancelled"
              />
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={t("myEvents")}
        description="Events you've signed up for."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/events">Find events</Link>
          </Button>
        }
      />

      {regs.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-5" aria-hidden />}
          title="No events yet"
          description="Join a blood donation drive, beach cleanup, sports day or celebration."
          action={
            <Button asChild size="sm">
              <Link href="/events">Browse events</Link>
            </Button>
          }
        />
      ) : (
        <>
          <section>
            <SectionHeader title={`Upcoming (${upcoming.length})`} />
            {upcoming.length === 0 ? (
              <EmptyState
                compact
                icon={<CalendarClock className="size-5" aria-hidden />}
                title="Nothing coming up"
                description="Browse events to find your next activity."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/events">Browse events</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {upcoming.map((row) => (
                  <li key={row.registration.id}>
                    <EventRow row={row} allowCancel />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-8">
              <SectionHeader title={`Past (${past.length})`} />
              <ul className="space-y-3">
                {past.map((row) => (
                  <li key={row.registration.id}>
                    <EventRow row={row} allowCancel={false} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
