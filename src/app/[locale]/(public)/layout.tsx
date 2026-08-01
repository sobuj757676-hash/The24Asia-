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
      <main id="main">{children}</main>
      {/*
        The bottom nav is `fixed`, so the LAST element on the page needs the
        clearance. That was on <main>, which left the footer's legal row sitting
        underneath the bar on mobile.
      */}
      <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <SiteFooter />
      </div>
      <BottomNav />
      <ServiceWorkerRegister />
      <InstallPrompt />
    </>
  );
}
