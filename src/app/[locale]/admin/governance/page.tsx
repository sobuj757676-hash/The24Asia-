import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { listMeetings, listRisks, listIncidents } from "@/server/queries/ops";
import { listPolicies } from "@/server/queries/admin";
import { saveMeeting, saveRisk, saveIncident } from "@/server/actions/ops";
import { savePolicy } from "@/server/actions/manage";
import { formatDate } from "@/lib/utils";
import { ShieldAlert, TriangleAlert, ScrollText, Users2, Boxes, Receipt } from "lucide-react";

const LEVELS = ["low", "medium", "high", "critical"];

export default async function AdminGovernance({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("audit:read");

  const [meetings, risks, incidents, policies] = await Promise.all([
    listMeetings(),
    listRisks(),
    listIncidents(),
    listPolicies(),
  ]);

  const openRisks = risks.filter((r) => r.status === "open").length;
  const openIncidents = incidents.filter((i) => i.status !== "closed").length;
  const severe = incidents.filter(
    (i) => i.status !== "closed" && (i.severity === "high" || i.severity === "critical"),
  ).length;

  return (
    <>
      <PageHeader
        title="Governance"
        description="Risk register, incidents, policies and meeting records — the evidence trail for trustees, funders and auditors."
        actions={
          <>
            <Link href="/admin/assets" className="text-sm text-brand-700 dark:text-brand-300 hover:underline">
              <Boxes className="mr-1 inline size-4" aria-hidden />Assets
            </Link>
            <Link href="/admin/volunteers/expenses" className="text-sm text-brand-700 dark:text-brand-300 hover:underline">
              <Receipt className="mr-1 inline size-4" aria-hidden />Expenses
            </Link>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Open risks" value={openRisks} icon={<TriangleAlert className="size-4" />} />
        <StatCard
          label="Open incidents"
          value={openIncidents}
          icon={<ShieldAlert className="size-4" />}
          tone={severe > 0 ? "accent" : "neutral"}
          hint={severe > 0 ? `${severe} high or critical` : undefined}
        />
        <StatCard label="Published policies" value={policies.filter((p) => p.published).length} icon={<ScrollText className="size-4" />} />
        <StatCard label="Meetings recorded" value={meetings.length} icon={<Users2 className="size-4" />} />
      </StatGrid>

      {/* Incidents first - highest operational urgency */}
      <section className="mt-8">
        <SectionHeader
          title={`Incidents (${incidents.length})`}
          description="Log operational, safety, data, security, conduct and reputational incidents."
        />
        <FormCard action={saveIncident} submitLabel="Log incident">
          <Field label="Type" htmlFor="type">
            <Input id="type" name="type" defaultValue="operational" />
          </Field>
          <Field label="Severity" htmlFor="severity">
            <Select id="severity" name="severity" defaultValue="low">
              {LEVELS.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <FormRow>
            <Field label="Summary" htmlFor="summary" required hint="Keep identifying detail to a minimum">
              <Textarea id="summary" name="summary" required />
            </Field>
          </FormRow>
        </FormCard>
        <div className="mt-4">
          {incidents.length === 0 ? (
            <EmptyState compact title="No incidents logged" description="That's good news." />
          ) : (
            <ul className="space-y-2">
              {incidents.map((i) => (
                <li key={i.id}>
                  <Card
                    className={
                      i.status !== "closed" && (i.severity === "critical" || i.severity === "high")
                        ? "border-red-300 dark:border-red-800"
                        : undefined
                    }
                  >
                    <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{i.summary}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {i.type} · {formatDate(i.createdAt, locale, { dateStyle: "medium" })}
                        </p>
                      </div>
                      <span className="flex gap-1.5">
                        <Badge
                          tone={
                            i.severity === "critical" || i.severity === "high" ? "danger" : "neutral"
                          }
                        >
                          {i.severity}
                        </Badge>
                        <Badge tone={i.status === "closed" ? "success" : "warning"}>{i.status}</Badge>
                      </span>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Risks */}
      <section className="mt-8">
        <SectionHeader title={`Risk register (${risks.length})`} />
        <FormCard action={saveRisk} submitLabel="Add risk">
          <Field label="Category" htmlFor="category">
            <Input id="category" name="category" defaultValue="operational" />
          </Field>
          <Field label="Status" htmlFor="status">
            <Input id="status" name="status" defaultValue="open" />
          </Field>
          <FormRow>
            <Field label="Description" htmlFor="description" required>
              <Input id="description" name="description" required />
            </Field>
          </FormRow>
          <Field label="Likelihood" htmlFor="likelihood">
            <Select id="likelihood" name="likelihood" defaultValue="low">
              {LEVELS.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <Field label="Impact" htmlFor="impact">
            <Select id="impact" name="impact" defaultValue="low">
              {LEVELS.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <FormRow>
            <Field label="Controls in place" htmlFor="controls">
              <Textarea id="controls" name="controls" />
            </Field>
          </FormRow>
        </FormCard>
        <div className="mt-4">
          {risks.length === 0 ? (
            <EmptyState compact title="No risks logged" />
          ) : (
            <ul className="space-y-2">
              {risks.map((r) => (
                <li key={r.id}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.description}</p>
                        <p className="text-xs text-[var(--muted)]">{r.category}</p>
                      </div>
                      <span className="flex gap-1.5">
                        <Badge>
                          {r.likelihood} / {r.impact}
                        </Badge>
                        <Badge tone={r.status === "open" ? "warning" : "success"}>{r.status}</Badge>
                      </span>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Policies */}
      <section className="mt-8">
        <SectionHeader title={`Policies (${policies.length})`} description="Published policies appear on the public site." />
        <FormCard action={savePolicy} submitLabel="Save policy">
          <Field label="Title" htmlFor="ptitle" required>
            <Input id="ptitle" name="title" required />
          </Field>
          <Field label="Version" htmlFor="version">
            <Input id="version" name="version" defaultValue="1.0" />
          </Field>
          <Field label="Effective from" htmlFor="effectiveAt">
            <Input id="effectiveAt" name="effectiveAt" type="date" />
          </Field>
          <FormRow>
            <Field label="Body" htmlFor="pbody">
              <Textarea id="pbody" name="body" className="min-h-32" />
            </Field>
          </FormRow>
          <CheckboxField name="published" label="Published" description="Visible publicly" />
        </FormCard>
        <div className="mt-4">
          {policies.length === 0 ? (
            <EmptyState compact title="No policies yet" />
          ) : (
            <ul className="space-y-2">
              {policies.map((p) => (
                <li key={p.id}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.title}</p>
                        <p className="text-xs text-[var(--muted)]">Version {p.version}</p>
                      </div>
                      <Badge tone={p.published ? "success" : "neutral"}>
                        {p.published ? "Published" : "Draft"}
                      </Badge>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Meetings */}
      <section className="mt-8">
        <SectionHeader title={`Meetings & minutes (${meetings.length})`} />
        <FormCard action={saveMeeting} submitLabel="Save meeting">
          <Field label="Title" htmlFor="mtitle" required>
            <Input id="mtitle" name="title" required />
          </Field>
          <Field label="Held on" htmlFor="heldAt">
            <Input id="heldAt" name="heldAt" type="date" />
          </Field>
          <FormRow>
            <Field label="Minutes" htmlFor="minutes">
              <Textarea id="minutes" name="minutes" />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Decisions" htmlFor="decisions">
              <Textarea id="decisions" name="decisions" />
            </Field>
          </FormRow>
        </FormCard>
        <div className="mt-4">
          {meetings.length === 0 ? (
            <EmptyState compact title="No meetings recorded" />
          ) : (
            <ul className="space-y-2">
              {meetings.map((m) => (
                <li key={m.id}>
                  <Card>
                    <CardBody className="flex items-center justify-between gap-3 p-4">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <span className="whitespace-nowrap text-xs text-[var(--muted)]">
                        {m.heldAt ? formatDate(m.heldAt, locale, { dateStyle: "medium" }) : "—"}
                      </span>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
