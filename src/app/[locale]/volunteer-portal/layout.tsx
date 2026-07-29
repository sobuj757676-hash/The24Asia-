import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { ensurePerson } from "@/lib/auth/onboarding";
import { availablePanels } from "@/lib/auth/panels";

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

  return (
    <AppShell
      panel="volunteer"
      title="Volunteer hub"
      user={{ name: user.displayName || user.name, email: user.email }}
      panels={availablePanels(user.roles)}
    >
      {children}
    </AppShell>
  );
}
