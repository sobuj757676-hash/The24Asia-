import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { person } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { updateProfile } from "@/server/actions/learner";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOCALE_LABELS, routing } from "@/i18n/routing";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [p] = await db.select().from(person).where(eq(person.id, user.personId)).limit(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">My profile</h1>
        <p className="text-[var(--muted)]">
          We collect the minimum needed. Optional fields help us support you better.
        </p>
      </div>
      <Card>
        <CardBody>
          <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name" htmlFor="displayName">
              <Input id="displayName" name="displayName" defaultValue={p?.displayName ?? ""} />
            </Field>
            <Field label="Preferred language" htmlFor="preferredLocale">
              <Select id="preferredLocale" name="preferredLocale" defaultValue={p?.preferredLocale ?? "en"}>
                {routing.locales.map((l) => (
                  <option key={l} value={l}>{LOCALE_LABELS[l] ?? l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Nationality (optional)" htmlFor="nationality">
              <Input id="nationality" name="nationality" defaultValue={p?.nationality ?? ""} />
            </Field>
            <Field label="Languages spoken (comma separated)" htmlFor="languagesSpoken">
              <Input id="languagesSpoken" name="languagesSpoken" defaultValue={(p?.languagesSpoken ?? []).join(", ")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Accessibility needs (optional)" htmlFor="accessibilityNeeds" hint="Tell us how we can support you during training or events.">
                <Textarea id="accessibilityNeeds" name="accessibilityNeeds" defaultValue={p?.accessibilityNeeds ?? ""} />
              </Field>
            </div>
            <div className="sm:col-span-2"><Button type="submit">Save profile</Button></div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
