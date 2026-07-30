import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { event, eventRegistration } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { registerForEvent, type ActionState } from "@/server/actions/enroll";
import { Container, Section } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { Field, Select } from "@/components/ui/input";
import { CheckboxField } from "@/components/ui/form";
import { ActionForm } from "@/components/portal/action-form";
import { CalendarDays, MapPin, Backpack, Users } from "lucide-react";
import { formatDate, isPast } from "@/lib/utils";

export const metadata = { title: "Register", robots: { index: false } };

const OPEN = ["published", "registration_open"];

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ locale: string; eventId: string }>;
}) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?redirect=/events/register/${eventId}`);

  const rows = await db.select().from(event).where(eq(event.id, eventId)).limit(1);
  if (!rows[0]) notFound();
  const e = rows[0];

  // Don't render a form the server action will reject.
  if (!OPEN.includes(e.status) || isPast(e.startsAt)) {
    redirect(`/events/${e.slug}`);
  }

  let full = false;
  if (e.capacity != null) {
    const [{ taken }] = await db
      .select({ taken: sql<number>`count(*)::int` })
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, e.id),
          sql`${eventRegistration.status} = ANY(ARRAY['registered','checked_in','attended']::registration_status[])`,
        ),
      );
    full = taken >= e.capacity;
  }

  async function action(
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    "use server";
    return registerForEvent(eventId, formData);
  }

  return (
    <Section>
      <Container className="max-w-xl">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {full ? "Join the waitlist" : "Register"}: {e.title}
        </h1>

        <Card className="mt-5">
          <CardBody className="space-y-2.5 text-sm">
            <p className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {formatDate(e.startsAt, locale, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
            {e.locationName && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                {e.locationName}
              </p>
            )}
            {e.whatToBring && (
              <p className="flex items-start gap-2">
                <Backpack className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                <span>
                  <span className="font-medium">What to bring: </span>
                  {e.whatToBring}
                </span>
              </p>
            )}
            {e.capacity != null && (
              <p className="flex items-start gap-2">
                <Users className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                Capacity {e.capacity}
                {full && (
                  <Badge tone="warning" className="ml-1">
                    Full
                  </Badge>
                )}
              </p>
            )}
          </CardBody>
        </Card>

        {full && (
          <p className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-sm dark:border-amber-800 dark:bg-amber-900/20">
            This event is full. You can still join the waitlist — we&apos;ll message you
            if a place opens up.
          </p>
        )}

        <div className="mt-6">
          <ActionForm
            action={action}
            submitLabel={full ? "Join waitlist" : "Confirm registration"}
            successRedirect="/account/events"
          >
            {e.allowGuests && (
              <Field
                label="Bringing anyone with you?"
                htmlFor="guests"
                hint="Friends and family are welcome at this event."
              >
                <Select id="guests" name="guests" defaultValue="0">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "Just me" : `${n} guest${n === 1 ? "" : "s"}`}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <CheckboxField
              name="allowPhoto"
              label="I'm okay with photos or videos of me being taken at this event"
              description="Completely optional. If you leave this unticked our team will make sure you are not photographed."
            />
          </ActionForm>
        </div>
      </Container>
    </Section>
  );
}
