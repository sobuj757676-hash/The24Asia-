import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleManager } from "@/components/admin/role-manager";
import { listUsersWithRoles } from "@/server/queries/admin";
import { STAFF_ROLES, type RoleKey } from "@/lib/auth/permissions";
import { Users, ShieldCheck, UserPlus, Info } from "lucide-react";

export default async function AdminUsers({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("user:manage");
  const users = await listUsersWithRoles();

  const staffCount = users.filter((u) =>
    u.roles.some((r) => STAFF_ROLES.includes(r.role as RoleKey)),
  ).length;
  const noProfile = users.filter((u) => !u.personId).length;

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Roles decide what each person can see and do. Every grant and revoke is recorded in the audit log."
      />

      <StatGrid cols={3}>
        <StatCard label="Accounts" value={users.length} icon={<Users className="size-4" />} />
        <StatCard label="Staff accounts" value={staffCount} icon={<ShieldCheck className="size-4" />} />
        <StatCard label="Awaiting first sign-in" value={noProfile} icon={<UserPlus className="size-4" />} />
      </StatGrid>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm dark:border-sky-800 dark:bg-sky-900/20">
        <Info className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden />
        <p>
          Safeguarding and moderation access are separate, restricted roles — they are never
          implied by being an administrator. Grant the narrowest role that lets someone do their job.
        </p>
      </div>

      <section className="mt-8">
        <SectionHeader title={`All accounts (${users.length})`} />
        {users.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" aria-hidden />}
            title="No accounts yet"
            description="People appear here after they sign in for the first time."
          />
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <Card key={u.userId}>
                <CardBody className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {u.displayName ?? u.name ?? "Unnamed account"}
                    </p>
                    <p className="truncate text-sm text-[var(--muted)]">{u.email}</p>
                  </div>
                  <RoleManager personId={u.personId} roles={u.roles} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
