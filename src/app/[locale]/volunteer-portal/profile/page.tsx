import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard, FormRow } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Award, CheckCircle2, FileCheck2, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getMyVolunteerProfile, getMyRecognition } from "@/server/queries/portal";
import { updateVolunteerProfile, acknowledgeHandbook } from "@/server/actions/volunteering";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My volunteer profile", robots: { index: false } };

export default async function VolunteerProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [profile, recognitions] = await Promise.all([
    getMyVolunteerProfile(user.personId),
    getMyRecognition(user.personId),
  ]);

  if (!profile) {
    return (
      <>
        <PageHeader
          title="My volunteer profile"
          description="Your skills, availability and recognition live here."
        />
        <EmptyState
          icon={<UserRound className="size-5" aria-hidden />}
          title="You are not an approved volunteer yet"
          description="Apply to an opportunity and once your application is approved your volunteer profile will be created automatically."
          action={
            <Button asChild size="sm">
              <Link href="/volunteer">Browse opportunities</Link>
            </Button>
          }
        />
      </>
    );
  }

  const skills = profile.skills ?? [];
  const languages = profile.languages ?? [];
  const availability = profile.availability ?? [];
  const profileComplete = skills.length > 0 && availability.length > 0;

  return (
    <>
      <PageHeader
        title="My volunteer profile"
        description="Keep your skills and availability up to date so coordinators can match you to the right roles."
        actions={<StatusBadge status={profile.standing} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Handbook acknowledgement (VOL-005) */}
          <Card>
            <CardBody>
              <SectionHeader
                title="Handbook & code of conduct"
                description="Every volunteer confirms they have read our safeguarding expectations."
              />
              {profile.handbookAcknowledgedAt ? (
                <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  Acknowledged on {formatDate(profile.handbookAcknowledgedAt, locale)}
                </p>
              ) : (
                <form action={acknowledgeHandbook} className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/70 px-3 py-2.5 text-sm dark:border-amber-800 dark:bg-amber-900/20">
                    <FileCheck2 className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                    <p>
                      Please read the{" "}
                      <Link href="/volunteer" className="font-medium underline">
                        volunteer handbook and code of conduct
                      </Link>{" "}
                      before confirming. This is required before you can be assigned to
                      roles that involve contact with people we support.
                    </p>
                  </div>
                  <SubmitButton size="sm" pendingLabel="Recording…">
                    I acknowledge the handbook
                  </SubmitButton>
                </form>
              )}
            </CardBody>
          </Card>

          {/* Skills / availability (VOL-011) */}
          <FormCard
            title="Skills & availability"
            description="Separate multiple entries with commas."
            action={updateVolunteerProfile}
            submitLabel="Save profile"
            pendingLabel="Saving…"
          >
            <Field label="Skills" htmlFor="skills" hint="e.g. Teaching, First aid, Translation">
              <Input id="skills" name="skills" defaultValue={skills.join(", ")} />
            </Field>
            <Field label="Languages" htmlFor="languages" hint="e.g. English, Bengali, Tamil">
              <Input id="languages" name="languages" defaultValue={languages.join(", ")} />
            </Field>
            <FormRow>
              <Field
                label="Availability"
                htmlFor="availability"
                hint="e.g. Weekends, Weekday evenings"
              >
                <Input
                  id="availability"
                  name="availability"
                  defaultValue={availability.join(", ")}
                />
              </Field>
            </FormRow>
          </FormCard>
        </div>

        {/* Summary rail */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-sm font-semibold">Profile summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Standing</dt>
                  <dd><StatusBadge status={profile.standing} /></dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Team</dt>
                  <dd className="font-medium">{profile.team ?? "Not assigned"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Total hours</dt>
                  <dd className="font-medium tabular-nums">{Number(profile.totalHours)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Volunteer since</dt>
                  <dd className="font-medium">{formatDate(profile.createdAt, locale)}</dd>
                </div>
              </dl>
              {!profileComplete && (
                <p className="rounded-xl bg-ink-50 px-3 py-2 text-xs text-[var(--muted)] dark:bg-ink-800">
                  Add your skills and availability to get matched to more opportunities.
                </p>
              )}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/volunteer-portal/hours">View my hours</Link>
              </Button>
            </CardBody>
          </Card>

          <div>
            <SectionHeader title="Recognition" />
            {recognitions.length === 0 ? (
              <EmptyState
                compact
                icon={<Award className="size-5" aria-hidden />}
                title="No recognition yet"
                description="Milestones and appreciation from the team will appear here."
              />
            ) : (
              <ul className="space-y-2">
                {recognitions.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-start gap-2.5 rounded-2xl border bg-[var(--card)] px-4 py-3"
                  >
                    <Award className="mt-0.5 size-4 shrink-0 text-accent-500" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {r.kind} · {formatDate(r.awardedAt, locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
