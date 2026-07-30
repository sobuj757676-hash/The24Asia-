import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { db } from "@/db";
import { person } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { updateProfile } from "@/server/actions/learner";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormCard, FormRow } from "@/components/ui/form";
import { Lock, ShieldCheck } from "lucide-react";
import { LOCALE_LABELS, routing } from "@/i18n/routing";

export const metadata = { title: "My profile", robots: { index: false } };

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [p] = await db
    .select()
    .from(person)
    .where(eq(person.id, user.personId))
    .limit(1);

  return (
    <>
      <PageHeader
        title="My profile"
        description="We collect the minimum needed to run our services. Optional fields simply help us support you better."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/account/privacy">Privacy &amp; my data</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FormCard
            title="Personal details"
            action={updateProfile}
            submitLabel="Save profile"
            pendingLabel="Saving…"
          >
            <Field label="Display name" htmlFor="displayName">
              <Input
                id="displayName"
                name="displayName"
                defaultValue={p?.displayName ?? ""}
                autoComplete="name"
              />
            </Field>
            <Field
              label="Preferred language"
              htmlFor="preferredLocale"
              hint="We'll use this for messages and certificates."
            >
              <Select
                id="preferredLocale"
                name="preferredLocale"
                defaultValue={p?.preferredLocale ?? "en"}
              >
                {routing.locales.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_LABELS[l] ?? l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Nationality (optional)"
              htmlFor="nationality"
              hint="Only used for aggregate reporting, never shown to employers."
            >
              <Input
                id="nationality"
                name="nationality"
                defaultValue={p?.nationality ?? ""}
              />
            </Field>
            <Field
              label="Languages spoken"
              htmlFor="languagesSpoken"
              hint="Comma separated — helps us match you to a trainer you understand."
            >
              <Input
                id="languagesSpoken"
                name="languagesSpoken"
                defaultValue={(p?.languagesSpoken ?? []).join(", ")}
              />
            </Field>
            <FormRow>
              <Field
                label="Accessibility needs (optional)"
                htmlFor="accessibilityNeeds"
                hint="Tell us how we can support you during training or events."
              >
                <Textarea
                  id="accessibilityNeeds"
                  name="accessibilityNeeds"
                  rows={3}
                  defaultValue={p?.accessibilityNeeds ?? ""}
                />
              </Field>
            </FormRow>
          </FormCard>
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-sm font-semibold">Sign-in details</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-[var(--muted)]">Email</dt>
                  <dd className="break-words font-medium">{user.email}</dd>
                </div>
              </dl>
              <p className="flex items-start gap-2 rounded-xl bg-ink-50 px-3 py-2 text-xs text-[var(--muted)] dark:bg-ink-800">
                <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                You sign in with a one-time code, so there is no password to
                remember or lose.
              </p>
            </CardBody>
          </Card>

          <Card className="border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20">
            <CardBody className="flex items-start gap-2.5">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-brand-600"
                aria-hidden
              />
              <p className="text-xs">
                You can download everything we hold about you, or ask us to delete
                it, from{" "}
                <Link href="/account/privacy" className="font-medium underline">
                  Privacy &amp; my data
                </Link>
                .
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
