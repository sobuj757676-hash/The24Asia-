import { eq } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { communicationPreference } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { updatePreferences } from "@/server/actions/preferences";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { ShieldCheck } from "lucide-react";

const TOPICS = [
  {
    key: "service",
    label: "Service updates",
    hint: "About courses, events and requests you already use.",
  },
  { key: "learning", label: "Learning opportunities", hint: "New courses and intakes." },
  { key: "events", label: "Events & community", hint: "Gatherings, live shows, sports." },
  { key: "volunteering", label: "Volunteering", hint: "Roles and shifts we need help with." },
  { key: "fundraising", label: "Fundraising", hint: "Appeals and campaigns." },
  { key: "marketing", label: "General news", hint: "Our newsletter and updates." },
] as const;

const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "inApp", label: "In-app" },
] as const;

export const metadata = { robots: { index: false } };

export default async function PreferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();

  const prefs = await db
    .select()
    .from(communicationPreference)
    .where(eq(communicationPreference.personId, user.personId));
  const prefMap = new Map(prefs.map((p) => [p.topic, p]));

  async function save(formData: FormData) {
    "use server";
    await updatePreferences(formData);
    revalidatePath("/account/preferences");
  }

  function defaultFor(topic: (typeof TOPICS)[number]["key"], channel: string) {
    const p = prefMap.get(topic);
    if (channel === "email") return p?.channelEmail ?? topic === "service";
    if (channel === "sms") return p?.channelSms ?? false;
    return p?.channelInApp ?? true;
  }

  return (
    <>
      <PageHeader
        title={t("preferences")}
        description="Choose how we may contact you. Safety and service messages about something you have signed up for are handled separately from marketing."
      />

      <form action={save} className="space-y-4">
        {/* One card per topic: readable on a 360px phone, tabular on desktop. */}
        {TOPICS.map((topic) => (
          <Card key={topic.key}>
            <CardBody>
              <fieldset>
                <legend className="font-semibold">{topic.label}</legend>
                <p className="mt-0.5 text-sm text-[var(--muted)]">{topic.hint}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                  {CHANNELS.map((ch) => {
                    const id = `${topic.key}.${ch.key}`;
                    return (
                      <label
                        key={ch.key}
                        htmlFor={id}
                        className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          id={id}
                          name={id}
                          type="checkbox"
                          defaultChecked={defaultFor(topic.key, ch.key)}
                          className="size-5 rounded accent-brand-600"
                        />
                        {ch.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </CardBody>
          </Card>
        ))}

        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton pendingLabel="Saving…">Save preferences</SubmitButton>
          <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
            You can change these at any time, and unsubscribe from any message.
          </p>
        </div>
      </form>
    </>
  );
}
