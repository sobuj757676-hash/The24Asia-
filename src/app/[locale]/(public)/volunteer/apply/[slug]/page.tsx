import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { opportunity } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { applyToOpportunity, type ActionState } from "@/server/actions/enroll";
import { Container, Section } from "@/components/ui/misc";
import { Field, Textarea } from "@/components/ui/input";
import { ActionForm } from "@/components/portal/action-form";

export const metadata = { title: "Volunteer application", robots: { index: false } };

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
  if (!rows[0]) redirect("/volunteer");
  const o = rows[0];

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
        <h1 className="text-2xl font-extrabold">Apply: {o.title}</h1>
        <p className="mt-1 text-[var(--muted)]">{o.purpose}</p>
        <div className="mt-6">
          <ActionForm
            action={action}
            submitLabel="Submit application"
            successRedirect="/volunteer-portal"
          >
            <Field
              label="Why do you want this role?"
              htmlFor="motivation"
              required
            >
              <Textarea id="motivation" name="motivation" required />
            </Field>
          </ActionForm>
        </div>
      </Container>
    </Section>
  );
}
