import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { BottomNav } from "@/components/public/bottom-nav";
import { InstallPrompt, ServiceWorkerRegister } from "@/components/public/pwa";
import { getCurrentUser } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("common");
  const user = await getCurrentUser();

  return (
    <>
      <a href="#main" className="skip-link">
        {t("skipToContent")}
      </a>
      <SiteHeader isAuthed={!!user} />
      <main id="main" className="pb-20 lg:pb-0">
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
      <ServiceWorkerRegister />
      <InstallPrompt />
    </>
  );
}
