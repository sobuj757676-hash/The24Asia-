import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-2xl font-extrabold">Request a private conversation</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          A trained member of our team will reach out. Share only what you are
          comfortable with. If you are in immediate danger, please use the{" "}
          <Link href="/support/urgent-help" className="text-brand-700 underline">urgent help</Link>{" "}
          contacts instead.
        </p>
        <form action={createSupportRequest} className="mt-6 space-y-4">
          <Field label="What would you like help with?" htmlFor="topic">
            <Input id="topic" name="topic" placeholder="e.g. career guidance, wellbeing" />
          </Field>
          <Field label="How should we contact you?" htmlFor="safeContactChannel">
            <Select id="safeContactChannel" name="safeContactChannel" defaultValue="in_app">
              <option value="in_app">In-app message</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </Select>
          </Field>
          <Field label="Best time to reach you" htmlFor="safeContactTime">
            <Input id="safeContactTime" name="safeContactTime" placeholder="e.g. weekday evenings" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="discreetMessageOnly" className="size-5" />
            Please keep messages discreet
          </label>
          <Button type="submit">Send request</Button>
        </form>
      </Container>
    </Section>
  );
}
