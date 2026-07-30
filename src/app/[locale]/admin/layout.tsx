import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/permissions";
import { availablePanels } from "@/lib/auth/panels";
import { allowedAdminHrefs } from "@/lib/auth/admin-nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/admin");
  if (!isStaff(user.roles)) redirect("/account");

  return (
    <AppShell
      panel="admin"
      title="Admin"
      user={{ name: user.displayName || user.name, email: user.email }}
      panels={availablePanels(user.roles)}
      allowedHrefs={allowedAdminHrefs(user.roles)}
    >
      {children}
    </AppShell>
  );
}
