import { setRequestLocale } from "next-intl/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { newsletterCampaign, subscriber } from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Stat } from "@/components/ui/misc";
import { SendCampaignButton } from "@/components/admin/send-campaign";
import { saveCampaign } from "@/server/actions/comms";
import { formatDate } from "@/lib/utils";

export default async function AdminComms({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("content:publish");

  const campaigns = await db
    .select()
    .from(newsletterCampaign)
    .orderBy(desc(newsletterCampaign.createdAt));
  const subscribers = await db.select().from(subscriber).orderBy(desc(subscriber.createdAt)).limit(500);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Communications</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat value={String(campaigns.length)} label="Campaigns" />
        <Stat value={String(subscribers.length)} label="Subscribers" />
        <Stat value={String(campaigns.filter((c) => c.status === "sent").length)} label="Sent" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">New campaign</h2>
        <Card>
          <CardBody>
            <form action={saveCampaign} className="grid gap-4 sm:grid-cols-2">
              <Field label="Title (internal)" htmlFor="title" required>
                <Input id="title" name="title" required />
              </Field>
              <Field label="Topic" htmlFor="topic">
                <Select id="topic" name="topic" defaultValue="marketing">
                  {["service","safety","learning","events","volunteering","fundraising","marketing"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Subject" htmlFor="subject" required>
                  <Input id="subject" name="subject" required />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Message" htmlFor="body" required>
                  <Textarea id="body" name="body" className="min-h-32" required />
                </Field>
              </div>
              <Field label="Channel" htmlFor="channel">
                <Select id="channel" name="channel" defaultValue="in_app">
                  <option value="in_app">In-app + push</option>
                  <option value="email">Email</option>
                </Select>
              </Field>
              <div className="sm:col-span-2"><Button type="submit">Save draft</Button></div>
            </form>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Campaigns</h2>
        {campaigns.length === 0 ? (
          <EmptyState title="No campaigns yet" />
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{c.subject}</CardTitle>
                    <p className="text-sm text-[var(--muted)]">
                      {c.topic} · {c.channel}
                      {c.sentAt ? ` · sent ${formatDate(c.sentAt, locale)} to ${c.recipientCount}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={c.status === "sent" ? "success" : "neutral"}>{c.status}</Badge>
                    {c.status !== "sent" && <SendCampaignButton id={c.id} />}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Subscribers ({subscribers.length})</h2>
        <div className="max-h-64 overflow-y-auto rounded-xl border bg-[var(--card)]">
          {subscribers.map((s) => (
            <div key={s.id} className="border-b px-3 py-2 text-sm last:border-0">
              {s.email}
            </div>
          ))}
          {subscribers.length === 0 && <p className="p-3 text-sm text-[var(--muted)]">No subscribers yet.</p>}
        </div>
      </section>
    </div>
  );
}
