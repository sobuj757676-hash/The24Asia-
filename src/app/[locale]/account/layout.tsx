import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortalShell } from "@/components/portal/portal-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { ensurePerson } from "@/lib/auth/onboarding";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/account");
  // Lazily create the person profile on first authenticated visit.
  if (!user.personId) await ensurePerson(user.userId, user.name);

  const t = await getTranslations("portal");
  const nav = [
    { href: "/account", label: t("learnerDashboard") },
    { href: "/account/courses", label: t("myCourses") },
    { href: "/account/materials", label: "Materials" },
    { href: "/account/assessments", label: "Assessments" },
    { href: "/account/certificates", label: t("myCertificates") },
    { href: "/account/events", label: t("myEvents") },
    { href: "/account/support", label: "Support" },
    { href: "/account/preferences", label: t("preferences") },
  ];

  return (
    <PortalShell title="24Asia" nav={nav}>
      {children}
    </PortalShell>
  );
}
