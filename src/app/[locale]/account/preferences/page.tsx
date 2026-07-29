import { eq } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/db";
import { communicationPreference } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { updatePreferences } from "@/server/actions/preferences";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

const TOPICS = [
  { key: "service", label: "Service updates (about courses you use)" },
  { key: "learning", label: "Learning opportunities" },
  { key: "events", label: "Events & community" },
  { key: "volunteering", label: "Volunteering" },
  { key: "fundraising", label: "Fundraising" },
  { key: "marketing", label: "General news & marketing" },
] as const;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t("preferences")}</h1>
        <p className="text-[var(--muted)]">
          Choose how we may contact you. Service and safety messages are handled
          separately from marketing.
        </p>
      </div>

      <form action={save}>
        <Card>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-sm font-semibold">
              <span>Topic</span>
              <span className="w-14 text-center">Email</span>
              <span className="w-14 text-center">SMS</span>
              <span className="w-14 text-center">In-app</span>
            </div>
            {TOPICS.map((topic) => {
              const p = prefMap.get(topic.key);
              return (
                <div
                  key={topic.key}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-t pt-3 text-sm"
                >
                  <label htmlFor={`${topic.key}.email`}>{topic.label}</label>
                  <input
                    id={`${topic.key}.email`}
                    name={`${topic.key}.email`}
                    type="checkbox"
                    defaultChecked={p?.channelEmail ?? topic.key === "service"}
                    className="mx-auto size-5"
                  />
                  <input
                    name={`${topic.key}.sms`}
                    type="checkbox"
                    defaultChecked={p?.channelSms ?? false}
                    aria-label={`${topic.label} SMS`}
                    className="mx-auto size-5"
                  />
                  <input
                    name={`${topic.key}.inApp`}
                    type="checkbox"
                    defaultChecked={p?.channelInApp ?? true}
                    aria-label={`${topic.label} in-app`}
                    className="mx-auto size-5"
                  />
                </div>
              );
            })}
          </CardBody>
        </Card>
        <Button type="submit" className="mt-4">
          Save preferences
        </Button>
      </form>
    </div>
  );
}
