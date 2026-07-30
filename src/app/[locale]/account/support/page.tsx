import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { mySupportRequests } from "@/server/queries/support";
import { getFlag, FLAGS } from "@/lib/flags";
import { formatDate } from "@/lib/utils";
import { LifeBuoy, TriangleAlert, MessageSquarePlus } from "lucide-react";

export default async function AccountSupport({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [requests, intakeOpen] = await Promise.all([
    mySupportRequests(user.personId),
    getFlag(FLAGS.SUPPORT_INTAKE),
  ]);

  return (
    <>
      <PageHeader
        title="Support"
        description="Private requests you've made, and where to find help."
        actions={
          intakeOpen ? (
            <Button asChild size="sm">
              <Link href="/support/request">
                <MessageSquarePlus className="size-4" aria-hidden /> New request
              </Link>
            </Button>
          ) : null
        }
      />

      {/* Urgent help is always one action away */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-accent-500 bg-accent-500/5 p-4">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-accent-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold">Need help right now?</p>
            <p className="text-sm text-[var(--muted)]">
              This platform isn&apos;t monitored around the clock. For urgent help, contact the
              services on our urgent-help page.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="accent">
          <Link href="/support/urgent-help">Urgent help</Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="size-5" aria-hidden />}
          title="No support requests"
          description={
            intakeOpen
              ? "You can ask a trained team member to contact you privately, at a time and on a channel that suits you."
              : "Reviewed wellbeing and career resources are available on the public support page."
          }
          action={
            <Button asChild size="sm" variant={intakeOpen ? "primary" : "outline"}>
              <Link href={intakeOpen ? "/support/request" : "/support"}>
                {intakeOpen ? "Request a private conversation" : "Browse trusted services"}
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => (
            <li key={r.id}>
              <Card>
                <CardBody className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {r.topic ?? "Support request"}
                      {r.discreetMessageOnly && <Badge tone="info">Discreet contact</Badge>}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      Requested {formatDate(r.createdAt, locale, { dateStyle: "medium" })} · we&apos;ll
                      reach you by {r.safeContactChannel?.replace(/_/g, "-")}
                      {r.safeContactTime ? ` (${r.safeContactTime})` : ""}
                    </p>
                    {r.outcome && (
                      <p className="mt-2 rounded-xl bg-ink-50 p-2.5 text-sm dark:bg-ink-800/60">
                        {r.outcome}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={r.status} />
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
