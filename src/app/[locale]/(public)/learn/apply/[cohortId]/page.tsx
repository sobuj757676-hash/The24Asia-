import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cohort, course, enrollment } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { applyToCohort, type ActionState } from "@/server/actions/enroll";
import { Container, Section } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, humanise } from "@/components/ui/status-badge";
import { Field, Textarea } from "@/components/ui/input";
import { ActionForm } from "@/components/portal/action-form";
import { CalendarDays, MapPin, Users, BadgeCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Apply", robots: { index: false } };

const OPEN = ["published", "registration_open", "waitlist_only"];

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string; cohortId: string }>;
}) {
  const { locale, cohortId } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?redirect=/learn/apply/${cohortId}`);

  const rows = await db
    .select({ cohort, course })
    .from(cohort)
    .innerJoin(course, eq(cohort.courseId, course.id))
    .where(eq(cohort.id, cohortId))
    .limit(1);
  if (!rows[0]) notFound();
  const { course: c, cohort: co } = rows[0];

  // Closed batches send the learner back to the course, not into a dead form.
  if (!OPEN.includes(co.status)) redirect(`/learn/${c.slug}`);

  const [{ taken }] = await db
    .select({ taken: sql<number>`count(*)::int` })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.cohortId, co.id),
        sql`${enrollment.status} = ANY(ARRAY['offered','enrolled','completed']::enrollment_status[])`,
      ),
    );
  const remaining = Math.max(co.capacity - taken, 0);
  const waitlistOnly = co.status === "waitlist_only" || remaining === 0;

  async function action(
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    "use server";
    return applyToCohort(cohortId, formData);
  }

  return (
    <Section>
      <Container className="max-w-xl">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Apply: {c.title}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[var(--muted)]">
          Batch {co.code}
          <Badge tone="success">
            <BadgeCheck className="size-3.5" aria-hidden />
            Free
          </Badge>
          <Badge>{humanise(co.deliveryMode)}</Badge>
          {waitlistOnly && <Badge tone="warning">Waitlist</Badge>}
        </p>

        <Card className="mt-5">
          <CardBody className="space-y-2.5 text-sm">
            <p className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {co.startDate
                ? `Starts ${formatDate(co.startDate, locale, { dateStyle: "full" })}`
                : "Start date to be confirmed"}
              {co.endDate
                ? ` · ends ${formatDate(co.endDate, locale, { dateStyle: "medium" })}`
                : ""}
            </p>
            {co.locationName && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                {co.locationName}
              </p>
            )}
            <p className="flex items-start gap-2">
              <Users className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {waitlistOnly
                ? "This batch is full — you'll be added to the waitlist."
                : `${remaining} of ${co.capacity} place${co.capacity === 1 ? "" : "s"} left`}
            </p>
          </CardBody>
        </Card>

        <p className="mt-4 text-sm text-[var(--muted)]">
          There is no fee and no test to get in. We&apos;ll confirm your place by email
          or phone, and you can follow your application in your account.
        </p>

        <div className="mt-6">
          <ActionForm
            action={action}
            submitLabel={waitlistOnly ? "Join the waitlist" : "Submit application"}
            successRedirect="/account/courses"
          >
            <Field
              label="Accessibility or language needs (optional)"
              htmlFor="accessibilityNeeds"
              hint="Tell us how we can support you during the training — for example a preferred language, or step-free access."
            >
              <Textarea id="accessibilityNeeds" name="accessibilityNeeds" rows={3} />
            </Field>
          </ActionForm>
        </div>
      </Container>
    </Section>
  );
}
