import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { getFlags } from "@/server/queries/admin";
import { Flag, Info } from "lucide-react";

export default async function AdminFlags({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("feature_flag:manage");
  const flags = await getFlags();
  const enabled = flags.filter((f) => f.enabled).length;

  return (
    <>
      <PageHeader
        title="Feature flags"
        description={`${enabled} of ${flags.length} capabilities enabled. Turning a capability on or off takes effect immediately and is recorded in the audit log.`}
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm dark:border-sky-800 dark:bg-sky-900/20">
        <Info className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden />
        <p>
          Some capabilities depend on operational readiness — for example public support intake
          needs trained staff coverage, and payments need a configured provider. Enable them only
          when your team is ready to operate them.
        </p>
      </div>

      {flags.length === 0 ? (
        <EmptyState
          icon={<Flag className="size-5" aria-hidden />}
          title="No feature flags configured"
          description="Run the database seed to create the default capability flags."
        />
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <Card key={f.key}>
              <CardBody className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{f.description}</p>
                    <Badge tone={f.enabled ? "success" : "neutral"}>
                      {f.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-[var(--muted)]">{f.key}</p>
                  {f.gateReason && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                      Readiness note: {f.gateReason}
                    </p>
                  )}
                </div>
                <FlagToggle flagKey={f.key} enabled={f.enabled} label={f.description} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
