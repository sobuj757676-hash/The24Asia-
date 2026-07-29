import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { event } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { registerForEvent, type ActionState } from "@/server/actions/enroll";
import { Container, Section } from "@/components/ui/misc";
import { ActionForm } from "@/components/portal/action-form";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Register", robots: { index: false } };

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ locale: string; eventId: string }>;
}) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?redirect=/events/register/${eventId}`);

  const rows = await db.select().from(event).where(eq(event.id, eventId)).limit(1);
  if (!rows[0]) redirect("/events");
  const e = rows[0];

  async function action(
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    "use server";
    return registerForEvent(eventId, formData);
  }

  return (
    <Section>
      <Container className="max-w-xl">
        <h1 className="text-2xl font-extrabold">Register: {e.title}</h1>
        <p className="mt-1 text-[var(--muted)]">
          {formatDate(e.startsAt, locale, {
            dateStyle: "full",
            timeStyle: "short",
          })}{" "}
          · {e.locationName}
        </p>
        <div className="mt-6">
          <ActionForm
            action={action}
            submitLabel="Confirm registration"
            successRedirect="/account/events"
          >
            <label className="flex items-center gap-2 text-sm">
              <input
                name="allowPhoto"
                type="checkbox"
                defaultChecked
                className="size-5"
              />
              I&apos;m okay with photos/videos being taken at this event.
            </label>
          </ActionForm>
        </div>
      </Container>
    </Section>
  );
}
