import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortalShell } from "@/components/portal/portal-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/permissions";

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
  // Coarse staff gate; each page enforces its specific permission.
  if (!isStaff(user.roles)) redirect("/account");

  const t = await getTranslations("admin");
  const nav = [
    { href: "/admin", label: t("overview") },
    { href: "/admin/programs", label: t("programs") },
    { href: "/admin/events", label: t("eventsAdmin") },
    { href: "/admin/volunteers", label: t("volunteers") },
    { href: "/admin/people", label: t("people") },
    { href: "/admin/audit", label: t("audit") },
    { href: "/admin/flags", label: t("flags") },
  ];

  return (
    <PortalShell title="24Asia Admin" nav={nav}>
      {children}
    </PortalShell>
  );
}
