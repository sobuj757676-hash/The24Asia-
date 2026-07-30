import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { ActionButton } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { getMyShifts, getUpcomingEventsForSignup } from "@/server/queries/portal";
import { signUpForShift, cancelShift } from "@/server/actions/volunteering";
import { formatDate } from "@/lib/utils";
import { CalendarDays, MapPin, CalendarPlus, CalendarCheck } from "lucide-react";

const OPEN = ["offered", "accepted", "confirmed", "checked_in"];

export default async function ShiftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const [shifts, available] = await Promise.all([
    getMyShifts(user.personId),
    getUpcomingEventsForSignup(user.personId),
  ]);

  const now = new Date();
  const upcoming = shifts.filter(
    (s) => s.shift.startsAt && new Date(s.shift.startsAt) >= now && s.shift.status !== "cancelled",
  );
  const past = shifts.filter(
    (s) => !s.shift.startsAt || new Date(s.shift.startsAt) < now || s.shift.status === "cancelled",
  );

  return (
    <>
      <PageHeader
        title={t("myShifts")}
        description="Shifts you've signed up for, and events that still need helpers."
      />

      <section>
        <SectionHeader title={`Upcoming (${upcoming.length})`} />
        {upcoming.length === 0 ? (
          <EmptyState
            compact
            icon={<CalendarCheck className="size-5" aria-hidden />}
            title="No upcoming shifts"
            description="Sign up below to help at an event."
          />
        ) : (
          <ul className="space-y-3">
            {upcoming.map(({ shift, event }) => (
              <li key={shift.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {event?.title ?? shift.role ?? "Shift"}
                        <StatusBadge status={shift.status} />
                      </p>
                      <div className="mt-1.5 space-y-1 text-sm text-[var(--muted)]">
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                          {shift.startsAt
                            ? formatDate(shift.startsAt, locale, {
                                dateStyle: "full",
                                timeStyle: "short",
                              })
                            : "Time to be confirmed"}
                        </p>
                        {event?.locationName && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0" aria-hidden />
                            {event.locationName}
                          </p>
                        )}
                        {shift.role && <p>Role: {shift.role}</p>}
                      </div>
                    </div>
                    {OPEN.includes(shift.status) && (
                      <ActionButton
                        action={cancelShift.bind(null, shift.id)}
                        label="Cancel shift"
                        variant="ghost"
                        confirmTitle="Cancel this shift?"
                        confirm="Please cancel as early as you can so the coordinator has time to find a replacement."
                        successMessage="Shift cancelled"
                      />
                    )}
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader
          title={`Events needing helpers (${available.length})`}
          description="Pick a role and sign yourself up."
        />
        {available.length === 0 ? (
          <EmptyState
            compact
            icon={<CalendarPlus className="size-5" aria-hidden />}
            title="Nothing to sign up for right now"
            description="New events appear here as they're scheduled."
          />
        ) : (
          <ul className="space-y-3">
            {available.map((e) => (
              <li key={e.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{e.title}</p>
                      <div className="mt-1.5 space-y-1 text-sm text-[var(--muted)]">
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                          {formatDate(e.startsAt, locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        {e.locationName && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0" aria-hidden />
                            {e.locationName}
                          </p>
                        )}
                      </div>
                    </div>
                    <form
                      action={signUpForShift.bind(null, e.id)}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <Field label="Your role" htmlFor={`role-${e.id}`}>
                        <Input
                          id={`role-${e.id}`}
                          name="role"
                          placeholder="e.g. registration desk"
                          className="w-full sm:w-48"
                        />
                      </Field>
                      <SubmitButton pendingLabel="Signing up…">Sign up</SubmitButton>
                    </form>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <SectionHeader title={`Past & cancelled (${past.length})`} />
          <ul className="space-y-2">
            {past.map(({ shift, event }) => (
              <li key={shift.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {event?.title ?? shift.role ?? "Shift"}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {shift.startsAt
                          ? formatDate(shift.startsAt, locale, { dateStyle: "medium" })
                          : "—"}
                      </p>
                    </div>
                    <StatusBadge status={shift.status} />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
