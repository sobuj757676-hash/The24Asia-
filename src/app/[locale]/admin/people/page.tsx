import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/status-badge";
import { DataList, type Column } from "@/components/ui/data-list";
import { getPeople } from "@/server/queries/admin";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

type Row = Awaited<ReturnType<typeof getPeople>>[number];

export default async function AdminPeople({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Scoped CRM read (PRD CRM-001).
  await requirePermission("person:read_scoped");
  const people = await getPeople();

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Name",
      primary: true,
      render: (p) => <span className="font-medium">{p.displayName ?? "—"}</span>,
    },
    {
      key: "locale",
      label: "Language",
      render: (p) => <Badge>{p.preferredLocale}</Badge>,
    },
    {
      key: "needs",
      label: "Accessibility needs",
      render: (p) => (
        <span className="text-[var(--muted)]">{p.accessibilityNeeds ? "Recorded" : "—"}</span>
      ),
    },
    {
      key: "joined",
      label: "Joined",
      align: "right",
      render: (p) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatDate(p.createdAt, locale)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="People"
        description="Role-appropriate relationship view. Support, safeguarding, health and identity-document records are deliberately excluded from this view (PRD CRM-002)."
      />
      {people.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" aria-hidden />}
          title="No people yet"
          description="Learners and volunteers appear here once they create an account."
        />
      ) : (
        <DataList columns={columns} rows={people} getKey={(p) => p.id} caption="People directory" />
      )}
    </>
  );
}
