import { setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard, FormRow } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Target, Users, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { myGoals, myMatches, isMentor } from "@/server/queries/support";
import { addGoal, requestMentorship, registerMentor } from "@/server/actions/career";

export const metadata = { title: "Career & mentorship", robots: { index: false } };

export default async function AccountCareer({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [goals, matches, mentor] = await Promise.all([
    myGoals(user.personId),
    myMatches(user.personId),
    isMentor(user.personId),
  ]);

  async function saveGoal(fd: FormData) {
    "use server";
    await addGoal(fd);
    revalidatePath("/account/career");
  }
  async function reqMentor(fd: FormData) {
    "use server";
    await requestMentorship(fd);
    revalidatePath("/account/career");
  }
  async function becomeMentor(fd: FormData) {
    "use server";
    await registerMentor(fd);
    revalidatePath("/account/career");
  }

  return (
    <>
      <PageHeader
        title="Career & mentorship"
        description="Set the goals that matter to you, and get matched with someone who can help you reach them."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Goals */}
        <section>
          <SectionHeader
            title="My goals"
            description="Small, specific goals are easier to achieve."
          />
          <Card>
            <CardBody className="space-y-4">
              <form action={saveGoal} className="flex flex-wrap items-end gap-3">
                <div className="min-w-56 flex-1">
                  <Field label="New goal" htmlFor="title">
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g. Learn Excel for office work"
                    />
                  </Field>
                </div>
                <SubmitButton size="sm" variant="outline" pendingLabel="Adding…">
                  Add goal
                </SubmitButton>
              </form>

              {goals.length === 0 ? (
                <EmptyState
                  compact
                  icon={<Target className="size-5" aria-hidden />}
                  title="No goals yet"
                  description="Add your first goal above — your mentor and trainers can help you work towards it."
                />
              ) : (
                <ul className="divide-y">
                  {goals.map((g) => (
                    <li
                      key={g.id}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm"
                    >
                      <span className="min-w-0">{g.title}</span>
                      <StatusBadge status={g.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>

        {/* Mentorship */}
        <section>
          <SectionHeader
            title="Mentorship"
            description="A mentor is a volunteer who gives you guidance one-to-one."
          />
          <Card>
            <CardBody className="space-y-4">
              <form action={reqMentor} className="flex flex-wrap items-end gap-3">
                <div className="min-w-56 flex-1">
                  <Field label="Request a mentor" htmlFor="topic">
                    <Input
                      id="topic"
                      name="topic"
                      placeholder="What do you want guidance on?"
                    />
                  </Field>
                </div>
                <SubmitButton size="sm" pendingLabel="Sending…">
                  Request mentorship
                </SubmitButton>
              </form>

              {matches.length === 0 ? (
                <EmptyState
                  compact
                  icon={<Users className="size-5" aria-hidden />}
                  title="No mentorship requests yet"
                  description="Tell us what you'd like help with and we'll look for a good match."
                />
              ) : (
                <ul className="divide-y">
                  {matches.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm"
                    >
                      <span className="min-w-0">{m.topic ?? "Mentorship"}</span>
                      <StatusBadge status={m.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>
      </div>

      {!mentor && (
        <section className="mt-8">
          <SectionHeader
            title="Become a mentor"
            description="Been through it yourself? Share what you know with someone starting out."
          />
          <FormCard
            action={becomeMentor}
            submitLabel="Register as mentor"
            pendingLabel="Registering…"
          >
            <Field
              label="Expertise"
              htmlFor="expertise"
              hint="Comma separated, e.g. Job interviews, Money management"
            >
              <Input id="expertise" name="expertise" />
            </Field>
            <Field label="Languages you can mentor in" htmlFor="mentorLanguages">
              <Input
                id="mentorLanguages"
                name="languages"
                placeholder="e.g. English, Bengali"
              />
            </Field>
            <FormRow>
              <Field
                label="Short bio"
                htmlFor="bio"
                hint="A couple of sentences so a mentee knows who you are."
              >
                <Textarea id="bio" name="bio" rows={3} />
              </Field>
            </FormRow>
          </FormCard>
        </section>
      )}

      {mentor && (
        <Card className="mt-8 border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20">
          <CardBody className="flex items-start gap-3 py-4">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <p className="text-sm">
              <span className="font-semibold">You&apos;re registered as a mentor. </span>
              Thank you — we&apos;ll be in touch when there&apos;s a mentee whose goals match
              your expertise.
            </p>
          </CardBody>
        </Card>
      )}
    </>
  );
}
