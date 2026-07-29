import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { SupportActions } from "@/components/admin/support-actions";
import { listSupportQueue } from "@/server/queries/support";
import { formatDate } from "@/lib/utils";

export default async function AdminSupport({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Restricted by assignment/purpose (PRD SUP-006).
  await requirePermission("support:handle");
  const queue = await listSupportQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Support & referrals</h1>
        <p className="text-[var(--muted)]">
          Restricted queue. Handle requests safely and record outcomes. Sensitive
          narratives are never shown in analytics or search (PRD 12.3).
        </p>
      </div>
      {queue.length === 0 ? (
        <EmptyState title="No support requests" />
      ) : (
        <div className="space-y-2">
          {queue.map(({ req, personName }) => (
            <Card key={req.id}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {req.topic ?? "Support request"}{" "}
                      <span className="text-sm font-normal text-[var(--muted)]">
                        · {personName ?? "anonymous"}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      Prefers {req.safeContactChannel}
                      {req.safeContactTime ? ` · ${req.safeContactTime}` : ""} ·{" "}
                      {formatDate(req.createdAt, locale, { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        req.severity === "critical"
                          ? "danger"
                          : req.severity === "high"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {req.severity}
                    </Badge>
                    <Badge tone={req.status === "completed" ? "success" : "neutral"}>
                      {req.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
                <SupportActions id={req.id} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
