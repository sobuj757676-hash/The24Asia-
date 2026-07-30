import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { opportunity } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { applyToOpportunity, type ActionState } from "@/server/actions/enroll";
import { Container, Section } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { Field, Textarea } from "@/components/ui/input";
import { ActionForm } from "@/components/portal/action-form";
import { Clock, MapPin, ShieldCheck, ListChecks } from "lucide-react";

export const metadata = { title: "Volunteer application", robots: { index: false } };

const RISK_TONE = { low: "neutral", medium: "warning", high: "danger" } as const;

export default async function VolunteerApplyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?redirect=/volunteer/apply/${slug}`);

  const rows = await db
    .select()
    .from(opportunity)
    .where(eq(opportunity.slug, slug))
    .limit(1);
  if (!rows[0]) notFound();
  const o = rows[0];
  // Unpublished roles are not open — don't show a form the action will reject.
  if (!o.published) redirect("/volunteer");

  async function action(
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    "use server";
    return applyToOpportunity(slug, formData);
  }

  return (
    <Section>
      <Container className="max-w-xl">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Apply: {o.title}
        </h1>
        {o.purpose && <p className="mt-2 text-[var(--muted)]">{o.purpose}</p>}

        <Card className="mt-5">
          <CardBody className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge tone={RISK_TONE[o.riskLevel]}>{o.riskLevel} risk</Badge>
              {o.requiresTraining && <Badge tone="info">Training provided</Badge>}
            </div>
            {o.duties && (
              <p className="flex items-start gap-2">
                <ListChecks className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                <span>
                  <span className="font-medium">What you&apos;ll do: </span>
                  {o.duties}
                </span>
              </p>
            )}
            {o.commitment && (
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                {o.commitment}
              </p>
            )}
            {o.locationName && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                {o.locationName}
              </p>
            )}
            {(o.skillsRequired ?? []).length > 0 && (
              <p className="text-[var(--muted)]">
                <span className="font-medium text-[var(--fg)]">Helpful skills: </span>
                {(o.skillsRequired ?? []).join(", ")}
              </p>
            )}
          </CardBody>
        </Card>

        {o.riskLevel !== "low" && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border bg-ink-50/60 p-4 text-sm dark:bg-ink-800/50">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            <span>
              This role involves contact with people we support, so we&apos;ll ask you to
              complete a short safeguarding check and accept our code of conduct before
              your first shift.
            </span>
          </p>
        )}

        <div className="mt-6">
          <ActionForm
            action={action}
            submitLabel="Submit application"
            successRedirect="/volunteer-portal/applications"
          >
            <Field
              label="Why do you want this role?"
              htmlFor="motivation"
              hint="A couple of sentences is plenty — tell us what you'd bring and what you hope to get out of it."
              required
            >
              <Textarea id="motivation" name="motivation" rows={4} required minLength={10} />
            </Field>
          </ActionForm>
        </div>
      </Container>
    </Section>
  );
}
