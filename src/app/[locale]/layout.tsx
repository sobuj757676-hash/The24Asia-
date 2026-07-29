import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { env } from "@/env";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "24Asia — Empowering migrant workers in Singapore",
    template: "%s · 24Asia",
  },
  description:
    "24Asia is a migrant-led volunteer group offering free training, community activities, and support for migrant workers in Singapore.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "24Asia", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "24Asia",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-dvh`}>
        <NextIntlClientProvider>
          {children}
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
