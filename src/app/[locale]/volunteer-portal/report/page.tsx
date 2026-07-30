import { setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Field, Textarea, Select, Input } from "@/components/ui/input";
import { FormCard, FormRow } from "@/components/ui/form";
import { AlertTriangle, Lock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { reportIncident } from "@/server/actions/volunteering";

export const metadata = { robots: { index: false } };

export default async function VolunteerReport({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser();

  async function submit(fd: FormData) {
    "use server";
    await reportIncident(fd);
    revalidatePath("/volunteer-portal/report");
  }

  return (
    <>
      <PageHeader
        title="Report a safety or conduct concern"
        description="Reports go straight to trained staff and are handled confidentially. Raising a concern in good faith will never count against you."
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-accent-500 bg-accent-500/5 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent-600" aria-hidden />
        <p className="text-sm">
          <span className="font-semibold">If someone is in immediate danger, </span>
          call 999 (police) or 995 (ambulance) first, then file this report. See also{" "}
          <Link href="/support/urgent-help" className="font-medium underline">
            urgent help contacts
          </Link>
          .
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border bg-ink-50/60 p-4 text-sm dark:bg-ink-800/50">
        <Lock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
        <p>
          Only the safeguarding team can read this. Please describe what you saw
          rather than what you concluded, and include names only where they matter
          to keeping someone safe.
        </p>
      </div>

      <FormCard
        action={submit}
        submitLabel="Submit report"
        pendingLabel="Submitting…"
      >
        <Field label="Type of concern" htmlFor="type">
          <Select id="type" name="type" defaultValue="safety">
            <option value="safety">Safety</option>
            <option value="conduct">Conduct or behaviour</option>
            <option value="operational">Operational problem</option>
            <option value="other">Something else</option>
          </Select>
        </Field>
        <Field
          label="How serious is it?"
          htmlFor="severity"
          hint="Your best judgement — staff will confirm the final severity."
        >
          <Select id="severity" name="severity" defaultValue="medium">
            <option value="low">Low — worth noting</option>
            <option value="medium">Medium — needs attention</option>
            <option value="high">High — act soon</option>
            <option value="critical">Critical — act now</option>
          </Select>
        </Field>
        <FormRow>
          <Field
            label="When did it happen?"
            htmlFor="occurredAt"
            hint="Approximate is fine."
          >
            <Input id="occurredAt" name="occurredAt" type="datetime-local" />
          </Field>
        </FormRow>
        <FormRow>
          <Field
            label="What happened?"
            htmlFor="summary"
            hint="Where it happened, who was involved, and what you saw or heard."
            required
          >
            <Textarea id="summary" name="summary" rows={6} required />
          </Field>
        </FormRow>
      </FormCard>
    </>
  );
}
