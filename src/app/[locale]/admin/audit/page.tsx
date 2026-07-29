import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { EmptyState } from "@/components/ui/misc";
import { getRecentAudit } from "@/server/queries/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminAudit({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("audit:read");
  const events = await getRecentAudit();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Audit log</h1>
        <p className="text-[var(--muted)]">
          Append-only record of sensitive actions (PRD 19.2).
        </p>
      </div>
      {events.length === 0 ? (
        <EmptyState title="No audit events yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-[var(--card)]">
          <table className="w-full text-sm">
            <thead className="border-b bg-ink-50 text-left dark:bg-ink-800">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Action</th>
                <th className="p-3">Object</th>
                <th className="p-3">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap p-3 text-[var(--muted)]">
                    {formatDate(e.occurredAt, locale, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="p-3 font-mono text-xs">{e.action}</td>
                  <td className="p-3 text-[var(--muted)]">
                    {e.objectType}
                  </td>
                  <td className="p-3">{e.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
