import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SupportActions } from "@/components/admin/support-actions";
import { listSupportQueue } from "@/server/queries/support";
import { formatDate } from "@/lib/utils";
import { LifeBuoy, ShieldAlert, Clock, CheckCircle2 } from "lucide-react";

const OPEN = ["received", "acknowledged", "triage", "assigned", "contact_attempted", "in_progress", "referred"];

export default async function AdminSupport({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Restricted queue - access is limited by assignment and purpose.
  await requirePermission("support:handle");
  const queue = await listSupportQueue();

  const open = queue.filter((q) => OPEN.includes(q.req.status));
  const urgent = open.filter((q) => q.req.severity === "critical" || q.req.severity === "high");
  const unassigned = open.filter((q) => !q.req.assignedToId);
  const closed = queue.filter((q) => !OPEN.includes(q.req.status));

  return (
    <>
      <PageHeader
        title="Support & referrals"
        description="A restricted queue. Handle requests safely, record outcomes, and share only what the person has consented to. Sensitive narratives never enter analytics or search."
      />

      <StatGrid>
        <StatCard label="Open requests" value={open.length} icon={<LifeBuoy className="size-4" />} />
        <StatCard
          label="High / critical"
          value={urgent.length}
          icon={<ShieldAlert className="size-4" />}
          tone={urgent.length > 0 ? "accent" : "neutral"}
        />
        <StatCard label="Unassigned" value={unassigned.length} icon={<Clock className="size-4" />} />
        <StatCard label="Closed" value={closed.length} icon={<CheckCircle2 className="size-4" />} />
      </StatGrid>

      <section className="mt-8">
        <SectionHeader
          title={`Open queue (${open.length})`}
          description="Highest severity first."
        />
        {open.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-5" aria-hidden />}
            title="Nothing open"
            description="Every support request has been resolved or closed. New requests will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {[...open]
              .sort((a, b) => {
                const rank = { critical: 0, high: 1, routine: 2 } as Record<string, number>;
                return (rank[a.req.severity] ?? 3) - (rank[b.req.severity] ?? 3);
              })
              .map(({ req, personName }) => (
                <li key={req.id}>
                  <Card
                    className={
                      req.severity === "critical"
                        ? "border-red-300 dark:border-red-800"
                        : undefined
                    }
                  >
                    <CardBody className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2 font-semibold">
                            {req.topic ?? "Support request"}
                            <StatusBadge
                              status={req.severity}
                              tone={
                                req.severity === "critical"
                                  ? "danger"
                                  : req.severity === "high"
                                    ? "warning"
                                    : "neutral"
                              }
                            />
                            <StatusBadge status={req.status} />
                            {!req.assignedToId && <Badge tone="info">Unassigned</Badge>}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {personName ?? "Anonymous"} · prefers {req.safeContactChannel}
                            {req.safeContactTime ? ` · ${req.safeContactTime}` : ""} ·{" "}
                            {formatDate(req.createdAt, locale, { dateStyle: "medium" })}
                          </p>
                          {req.discreetMessageOnly && (
                            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                              Discreet contact requested — do not leave identifying messages.
                            </p>
                          )}
                        </div>
                      </div>
                      <SupportActions id={req.id} />
                    </CardBody>
                  </Card>
                </li>
              ))}
          </ul>
        )}
      </section>

      {closed.length > 0 && (
        <section className="mt-8">
          <SectionHeader title={`Recently closed (${closed.length})`} />
          <ul className="space-y-2">
            {closed.slice(0, 10).map(({ req, personName }) => (
              <li key={req.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {req.topic ?? "Support request"}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {personName ?? "Anonymous"} ·{" "}
                        {formatDate(req.createdAt, locale, { dateStyle: "medium" })}
                        {req.outcome ? ` · ${req.outcome}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
