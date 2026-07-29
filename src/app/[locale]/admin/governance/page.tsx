import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { listMeetings, listRisks, listIncidents } from "@/server/queries/ops";
import { saveMeeting, saveRisk, saveIncident } from "@/server/actions/ops";
import { savePolicy } from "@/server/actions/manage";
import { listPolicies } from "@/server/queries/admin";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Governance</h1>

      {/* Risks */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Risk register</h2>
        <Card>
          <CardBody>
            <form action={saveRisk} className="grid gap-3 sm:grid-cols-2">
              <Field label="Category" htmlFor="category"><Input id="category" name="category" defaultValue="operational" /></Field>
              <Field label="Status" htmlFor="status"><Input id="status" name="status" defaultValue="open" /></Field>
              <div className="sm:col-span-2"><Field label="Description" htmlFor="description"><Input id="description" name="description" required /></Field></div>
              <Field label="Likelihood" htmlFor="likelihood">
                <Select id="likelihood" name="likelihood" defaultValue="low">{["low","medium","high","critical"].map((x)=><option key={x}>{x}</option>)}</Select>
              </Field>
              <Field label="Impact" htmlFor="impact">
                <Select id="impact" name="impact" defaultValue="low">{["low","medium","high","critical"].map((x)=><option key={x}>{x}</option>)}</Select>
              </Field>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Add risk</Button></div>
            </form>
            <ul className="mt-4 space-y-1 text-sm">
              {risks.map((r) => (
                <li key={r.id} className="flex items-center justify-between border-b py-2">
                  <span>{r.description}</span>
                  <span className="flex gap-1"><Badge>{r.likelihood}/{r.impact}</Badge><Badge tone={r.status === "open" ? "warning" : "success"}>{r.status}</Badge></span>
                </li>
              ))}
              {risks.length === 0 && <li className="list-none"><EmptyState title="No risks logged" /></li>}
            </ul>
          </CardBody>
        </Card>
      </section>

      {/* Incidents */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Incidents</h2>
        <Card>
          <CardBody>
            <form action={saveIncident} className="grid gap-3 sm:grid-cols-2">
              <Field label="Type" htmlFor="type"><Input id="type" name="type" defaultValue="operational" /></Field>
              <Field label="Severity" htmlFor="severity">
                <Select id="severity" name="severity" defaultValue="low">{["low","medium","high","critical"].map((x)=><option key={x}>{x}</option>)}</Select>
              </Field>
              <div className="sm:col-span-2"><Field label="Summary" htmlFor="summary"><Input id="summary" name="summary" required /></Field></div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Log incident</Button></div>
            </form>
            <ul className="mt-4 space-y-1 text-sm">
              {incidents.map((i) => (
                <li key={i.id} className="flex items-center justify-between border-b py-2">
                  <span>{i.summary}</span>
                  <span className="flex gap-1"><Badge tone={i.severity === "critical" || i.severity === "high" ? "danger" : "neutral"}>{i.severity}</Badge><Badge>{i.status}</Badge></span>
                </li>
              ))}
              {incidents.length === 0 && <li className="list-none"><EmptyState title="No incidents" /></li>}
            </ul>
          </CardBody>
        </Card>
      </section>

      {/* Policies */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Policies</h2>
        <Card>
          <CardBody>
            <form action={savePolicy} className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" htmlFor="title"><Input id="title" name="title" required /></Field>
              <Field label="Version" htmlFor="version"><Input id="version" name="version" defaultValue="1.0" /></Field>
              <div className="sm:col-span-2"><Field label="Body" htmlFor="body"><Textarea id="body" name="body" /></Field></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" className="size-5" /> Published</label>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Save policy</Button></div>
            </form>
            <ul className="mt-4 space-y-1 text-sm">
              {policies.map((p) => (
                <li key={p.id} className="flex items-center justify-between border-b py-2">
                  <span>{p.title} <span className="text-xs text-[var(--muted)]">v{p.version}</span></span>
                  <Badge tone={p.published ? "success" : "neutral"}>{p.published ? "Published" : "Draft"}</Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      {/* Meetings */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Meetings & minutes</h2>
        <Card>
          <CardBody>
            <form action={saveMeeting} className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" htmlFor="mtitle"><Input id="mtitle" name="title" required /></Field>
              <Field label="Held at" htmlFor="heldAt"><Input id="heldAt" name="heldAt" type="date" /></Field>
              <div className="sm:col-span-2"><Field label="Minutes" htmlFor="minutes"><Textarea id="minutes" name="minutes" /></Field></div>
              <div className="sm:col-span-2"><Field label="Decisions" htmlFor="decisions"><Textarea id="decisions" name="decisions" /></Field></div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Save meeting</Button></div>
            </form>
            <ul className="mt-4 space-y-1 text-sm">
              {meetings.map((m) => (
                <li key={m.id} className="flex items-center justify-between border-b py-2">
                  <span>{m.title}</span>
                  <span className="text-xs text-[var(--muted)]">{m.heldAt ? formatDate(m.heldAt, locale) : "—"}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <p className="text-sm text-[var(--muted)]">
        See also{" "}
        <Link href="/admin/assets" className="text-brand-700 underline">assets & inventory</Link>{" "}
        and{" "}
        <Link href="/admin/volunteers/expenses" className="text-brand-700 underline">expense approvals</Link>.
      </p>
    </div>
  );
}
