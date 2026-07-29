import { setRequestLocale } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getMyVolunteerProfile, getMyRecognition } from "@/server/queries/portal";
import { updateVolunteerProfile, acknowledgeHandbook } from "@/server/actions/volunteering";
import { formatDate } from "@/lib/utils";

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
      <EmptyState
        title="You are not an approved volunteer yet"
        body="Apply to an opportunity to create your volunteer profile."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">My volunteer profile</h1>
        <Badge tone="brand">{profile.standing}</Badge>
      </div>

      {/* Handbook acknowledgement (VOL-005) */}
      <Card>
        <CardBody>
          <h2 className="font-semibold">Handbook & code of conduct</h2>
          {profile.handbookAcknowledgedAt ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-brand-700">
              <CheckCircle2 className="size-4" aria-hidden />
              Acknowledged on {formatDate(profile.handbookAcknowledgedAt, locale)}
            </p>
          ) : (
            <form action={acknowledgeHandbook} className="mt-2">
              <p className="text-sm text-[var(--muted)]">
                Please read and acknowledge the volunteer handbook and code of
                conduct.
              </p>
              <Button type="submit" size="sm" className="mt-3">
                I acknowledge the handbook
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

      {/* Skills / availability (VOL-011) */}
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">Skills & availability</h2>
          <form action={updateVolunteerProfile} className="grid gap-4 sm:grid-cols-2">
            <Field label="Skills (comma separated)" htmlFor="skills">
              <Input id="skills" name="skills" defaultValue={(profile.skills ?? []).join(", ")} />
            </Field>
            <Field label="Languages" htmlFor="languages">
              <Input id="languages" name="languages" defaultValue={(profile.languages ?? []).join(", ")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Availability" htmlFor="availability" hint="e.g. Weekends, Weekday evenings">
                <Input id="availability" name="availability" defaultValue={(profile.availability ?? []).join(", ")} />
              </Field>
            </div>
            <div className="sm:col-span-2"><Button type="submit">Save profile</Button></div>
          </form>
        </CardBody>
      </Card>

      {/* Recognition (VOL-014) */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Recognition</h2>
        {recognitions.length === 0 ? (
          <EmptyState title="No recognition yet" body="Milestones and appreciation will appear here." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {recognitions.map((r) => (
              <div key={r.id} className="rounded-xl border bg-[var(--card)] px-4 py-3">
                <p className="font-semibold">{r.label}</p>
                <p className="text-xs text-[var(--muted)]">{r.kind} · {formatDate(r.awardedAt, locale)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
