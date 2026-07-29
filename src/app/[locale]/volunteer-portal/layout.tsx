import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortalShell } from "@/components/portal/portal-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { ensurePerson } from "@/lib/auth/onboarding";

export default async function VolunteerPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/volunteer-portal");
  if (!user.personId) await ensurePerson(user.userId, user.name);

  const t = await getTranslations("portal");
  const nav = [
    { href: "/volunteer-portal", label: t("volunteerDashboard") },
    { href: "/volunteer-portal/applications", label: t("myApplications") },
    { href: "/volunteer-portal/shifts", label: t("myShifts") },
    { href: "/volunteer-portal/hours", label: t("myHours") },
  ];

  return (
    <PortalShell title="24Asia Volunteer" nav={nav}>
      {children}
    </PortalShell>
  );
}
