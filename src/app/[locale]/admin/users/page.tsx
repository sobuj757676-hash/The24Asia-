import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { RoleManager } from "@/components/admin/role-manager";
import { listUsersWithRoles } from "@/server/queries/admin";

export default async function AdminUsers({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("user:manage");
  const users = await listUsersWithRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Users & roles</h1>
        <p className="text-[var(--muted)]">
          Grant roles to configure who can manage the platform. Changes are
          audited (PRD 11, 19.2).
        </p>
      </div>
      {users.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.userId}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{u.displayName ?? u.name ?? "—"}</p>
                  <p className="text-sm text-[var(--muted)]">{u.email}</p>
                </div>
                <RoleManager personId={u.personId} roles={u.roles} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
