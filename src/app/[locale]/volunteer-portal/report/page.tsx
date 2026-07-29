import { setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Report a safety or conduct concern</h1>
        <p className="text-[var(--muted)]">
          Reports go to trained staff and are handled confidentially. If someone
          is in immediate danger, contact emergency services first.
        </p>
      </div>
      <Card>
        <CardBody>
          <form action={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" defaultValue="safety">
                <option value="safety">Safety</option>
                <option value="conduct">Conduct</option>
                <option value="operational">Operational</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Severity" htmlFor="severity">
              <Select id="severity" name="severity" defaultValue="medium">
                {["low", "medium", "high", "critical"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="What happened?" htmlFor="summary" required>
                <Textarea id="summary" name="summary" required />
              </Field>
            </div>
            <div className="sm:col-span-2"><Button type="submit">Submit report</Button></div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
