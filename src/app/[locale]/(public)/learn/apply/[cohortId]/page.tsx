import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cohort, course } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { applyToCohort, type ActionState } from "@/server/actions/enroll";
import { Container, Section } from "@/components/ui/misc";
import { Field, Textarea } from "@/components/ui/input";
import { ActionForm } from "@/components/portal/action-form";

export const metadata = { title: "Apply", robots: { index: false } };

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
  if (!rows[0]) redirect("/learn");
  const { course: c, cohort: co } = rows[0];

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
        <h1 className="text-2xl font-extrabold">Apply: {c.title}</h1>
        <p className="mt-1 text-[var(--muted)]">
          Batch {co.code}. This training is free.
        </p>
        <div className="mt-6">
          <ActionForm
            action={action}
            submitLabel="Submit application"
            successRedirect="/account"
          >
            <Field
              label="Accessibility or language needs (optional)"
              htmlFor="accessibilityNeeds"
              hint="Tell us how we can support you during the training."
            >
              <Textarea id="accessibilityNeeds" name="accessibilityNeeds" />
            </Field>
          </ActionForm>
        </div>
      </Container>
    </Section>
  );
}
