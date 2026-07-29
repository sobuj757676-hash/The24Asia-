import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  { href: "/admin/content/pages", title: "Pages & articles", desc: "CMS pages, stories, news, FAQ" },
  { href: "/admin/content/metrics", title: "Impact metrics", desc: "Public numbers with definitions & sources" },
  { href: "/admin/content/services", title: "Trusted services", desc: "Support directory & urgent help" },
  { href: "/admin/content/partners", title: "Partners", desc: "Partner logos & directory" },
  { href: "/admin/content/episodes", title: "Live shows", desc: "Episode archive" },
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
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Content</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="transition-colors hover:border-brand-400">
              <CardBody>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
