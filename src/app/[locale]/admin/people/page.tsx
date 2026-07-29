import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Badge, EmptyState } from "@/components/ui/misc";
import { getPeople } from "@/server/queries/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminPeople({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Scoped CRM read (PRD CRM-001). Sensitive records excluded from this view.
  await requirePermission("person:read_scoped");
  const people = await getPeople();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">People</h1>
        <p className="text-[var(--muted)]">
          Sensitive support, safeguarding and identity records are not shown
          here (PRD CRM-002).
        </p>
      </div>
      {people.length === 0 ? (
        <EmptyState title="No people yet" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-[var(--card)]">
          <table className="w-full text-sm">
            <thead className="border-b bg-ink-50 text-left dark:bg-ink-800">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Locale</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">{p.displayName ?? "—"}</td>
                  <td className="p-3">
                    <Badge>{p.preferredLocale}</Badge>
                  </td>
                  <td className="p-3 text-[var(--muted)]">
                    {formatDate(p.createdAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
