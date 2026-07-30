import { setRequestLocale } from "next-intl/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { newsletterCampaign, subscriber } from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { FormCard, FormRow } from "@/components/ui/form";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SendCampaignButton } from "@/components/admin/send-campaign";
import { saveCampaign } from "@/server/actions/comms";
import { formatDate } from "@/lib/utils";
import { Megaphone, Send, Mail, Users, Info } from "lucide-react";

const TOPICS = ["service", "safety", "learning", "events", "volunteering", "fundraising", "marketing"];

export default async function AdminComms({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("content:publish");

  const [campaigns, subscribers] = await Promise.all([
    db.select().from(newsletterCampaign).orderBy(desc(newsletterCampaign.createdAt)),
    db.select().from(subscriber).orderBy(desc(subscriber.createdAt)).limit(500),
  ]);

  const sent = campaigns.filter((c) => c.status === "sent");
  const drafts = campaigns.filter((c) => c.status !== "sent");
  const reached = sent.reduce((n, c) => n + c.recipientCount, 0);

  return (
    <>
      <PageHeader
        title="Communications"
        description="Send in-app and push messages to people who have consented to that topic. Service messages are kept separate from marketing."
      />

      <StatGrid>
        <StatCard label="Campaigns" value={campaigns.length} icon={<Megaphone className="size-4" />} />
        <StatCard label="Sent" value={sent.length} icon={<Send className="size-4" />} />
        <StatCard label="People reached" value={reached} icon={<Users className="size-4" />} />
        <StatCard label="Newsletter subscribers" value={subscribers.length} icon={<Mail className="size-4" />} />
      </StatGrid>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm dark:border-sky-800 dark:bg-sky-900/20">
        <Info className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden />
        <p>
          The audience is built from each person&apos;s communication preferences — anyone who has
          opted out of the topic is excluded automatically. Keep lock-screen copy discreet: it must
          not reveal someone&apos;s circumstances.
        </p>
      </div>

      <div className="mt-8">
        <FormCard
          title="New campaign"
          description="Saved as a draft first, so you can review before sending."
          action={saveCampaign}
          submitLabel="Save draft"
        >
          <Field label="Internal title" htmlFor="title" required hint="Only staff see this">
            <Input id="title" name="title" required />
          </Field>
          <Field label="Topic" htmlFor="topic" hint="Determines who receives it">
            <Select id="topic" name="topic" defaultValue="marketing">
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <FormRow>
            <Field label="Subject" htmlFor="subject" required hint="Keep it discreet">
              <Input id="subject" name="subject" required />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Message" htmlFor="body" required>
              <Textarea id="body" name="body" className="min-h-32" required />
            </Field>
          </FormRow>
          <Field label="Channel" htmlFor="channel">
            <Select id="channel" name="channel" defaultValue="in_app">
              <option value="in_app">In-app + push</option>
              <option value="email">Email</option>
            </Select>
          </Field>
        </FormCard>
      </div>

      <section className="mt-8">
        <SectionHeader title={`Drafts & scheduled (${drafts.length})`} />
        {drafts.length === 0 ? (
          <EmptyState compact title="No drafts" description="Create a campaign above to get started." />
        ) : (
          <ul className="space-y-2">
            {drafts.map((c) => (
              <li key={c.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.subject}</p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {c.title} · {c.topic} · {c.channel.replace(/_/g, "-")}
                      </p>
                    </div>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      <SendCampaignButton id={c.id} />
                    </span>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sent.length > 0 && (
        <section className="mt-8">
          <SectionHeader title={`Sent (${sent.length})`} />
          <ul className="space-y-2">
            {sent.map((c) => (
              <li key={c.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.subject}</p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {c.sentAt ? `Sent ${formatDate(c.sentAt, locale, { dateStyle: "medium" })}` : ""} ·{" "}
                        {c.recipientCount} recipients
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <SectionHeader
          title={`Newsletter subscribers (${subscribers.length})`}
          description="Collected from the public site footer."
        />
        {subscribers.length === 0 ? (
          <EmptyState compact title="No subscribers yet" />
        ) : (
          <Card>
            <CardBody className="max-h-72 overflow-y-auto p-0">
              <ul className="divide-y">
                {subscribers.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="truncate">{s.email}</span>
                    <Badge tone={s.unsubscribedAt ? "neutral" : "success"}>
                      {s.unsubscribedAt ? "Unsubscribed" : "Subscribed"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </section>
    </>
  );
}
