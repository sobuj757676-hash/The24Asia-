import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Field, Input, Select } from "@/components/ui/input";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { AlertTriangle, Lock } from "lucide-react";
import { getFlag, FLAGS } from "@/lib/flags";
import { createSupportRequest } from "@/server/actions/support";

export const metadata = { title: "Request contact", robots: { index: false } };

export default async function SupportRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const enabled = await getFlag(FLAGS.SUPPORT_INTAKE);
  if (!enabled) redirect("/support");

  return (
    <Section>
      <Container className="max-w-lg">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Request a private conversation
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          A trained member of our team will reach out. Share only what you are
          comfortable with — you can tell us more later.
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-accent-500 bg-accent-500/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent-600" aria-hidden />
          <p className="text-sm">
            <span className="font-semibold">If you are in immediate danger, </span>
            call 999 (police) or 995 (ambulance) now, or use our{" "}
            <Link href="/support/urgent-help" className="font-medium underline">
              urgent help contacts
            </Link>
            .
          </p>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border bg-ink-50/60 p-4 text-sm dark:bg-ink-800/50">
          <Lock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          <p>
            Only the support team can see this request. We never contact your employer
            or dormitory about it, and we never share it without your permission.
          </p>
        </div>

        <div className="mt-6">
          <FormCard
            action={createSupportRequest}
            submitLabel="Send request"
            pendingLabel="Sending…"
          >
            <FormRow>
              <Field
                label="What would you like help with?"
                htmlFor="topic"
                hint="A few words is enough."
              >
                <Input
                  id="topic"
                  name="topic"
                  placeholder="e.g. career guidance, wellbeing, salary problem"
                />
              </Field>
            </FormRow>
            <Field label="How should we contact you?" htmlFor="safeContactChannel">
              <Select
                id="safeContactChannel"
                name="safeContactChannel"
                defaultValue="in_app"
              >
                <option value="in_app">In-app message (most private)</option>
                <option value="phone">Phone call</option>
                <option value="email">Email</option>
              </Select>
            </Field>
            <Field
              label="Best time to reach you"
              htmlFor="safeContactTime"
              hint="So we don't call while you're at work."
            >
              <Input
                id="safeContactTime"
                name="safeContactTime"
                placeholder="e.g. weekday evenings after 8pm"
              />
            </Field>
            <FormRow>
              <CheckboxField
                name="discreetMessageOnly"
                label="Please keep messages discreet"
                description="We'll avoid mentioning 24Asia or the reason for contact in any message."
              />
            </FormRow>
          </FormCard>
        </div>
      </Container>
    </Section>
  );
}
