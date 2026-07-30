import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { FileText, BarChart3, LifeBuoy, Building2, Radio, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    href: "/admin/content/pages",
    title: "Pages & articles",
    desc: "CMS pages, stories, news and FAQs",
    icon: FileText,
  },
  {
    href: "/admin/content/metrics",
    title: "Impact metrics",
    desc: "Public numbers with definitions and sources",
    icon: BarChart3,
  },
  {
    href: "/admin/content/services",
    title: "Trusted services",
    desc: "Support directory and urgent-help contacts",
    icon: LifeBuoy,
  },
  {
    href: "/admin/content/partners",
    title: "Partners",
    desc: "Partner directory and portal access",
    icon: Building2,
  },
  {
    href: "/admin/content/episodes",
    title: "Live shows",
    desc: "Episode archive",
    icon: Radio,
  },
];

export default async function AdminContent({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("content:read");

  return (
    <>
      <PageHeader
        title="Content"
        description="Everything published on the public website is managed here."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full transition-all hover:border-brand-400 hover:shadow-md">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <ArrowRight
                      className="size-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                      aria-hidden
                    />
                  </div>
                  <h2 className="mt-3 font-semibold">{s.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{s.desc}</p>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
