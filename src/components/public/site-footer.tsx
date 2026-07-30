import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { NewsletterSignup } from "./newsletter-signup";

export function SiteFooter() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  const cols = [
    {
      heading: t("learn"),
      links: [
        { label: t("courses"), href: "/learn" },
        { label: t("howTrainingWorks"), href: "/learn/how-it-works" },
        { label: t("trainingCalendar"), href: "/learn/schedule" },
        { label: "Pathways", href: "/learn/pathways" },
        { label: t("verifyCertificate"), href: "/verify" },
      ],
    },
    {
      heading: t("events"),
      links: [
        { label: t("upcomingEvents"), href: "/events" },
        { label: t("liveShows"), href: "/live-shows" },
        { label: "Community", href: "/community" },
      ],
    },
    {
      heading: t("support"),
      links: [
        { label: t("wellbeing"), href: "/support" },
        { label: "Careers", href: "/careers" },
        { label: "Shop", href: "/shop" },
        { label: t("urgentHelp"), href: "/support/urgent-help" },
      ],
    },
    {
      heading: t("impact"),
      links: [
        { label: t("stories"), href: "/stories" },
        { label: "Impact", href: "/impact" },
        { label: "Policies", href: "/policies" },
      ],
    },
    {
      heading: t("about"),
      links: [
        { label: t("team"), href: "/about/team" },
        { label: t("partners"), href: "/about/partners" },
        { label: t("contact"), href: "/about/contact" },
        { label: t("volunteer"), href: "/volunteer" },
      ],
    },
  ];

  return (
    <footer className="mt-8 border-t bg-[var(--card)]">
      {/* Urgent help stays reachable from the bottom of every page */}
      <div className="border-b bg-accent-500/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <p className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="size-4 shrink-0 text-accent-600" aria-hidden />
            Need help urgently? You are not alone.
          </p>
          <Link
            href="/support/urgent-help"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:underline"
          >
            {t("urgentHelp")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 font-extrabold text-brand-700">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
              24
            </span>
            24Asia
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">{tc("tagline")}</p>
          <div className="mt-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Newsletter
            </p>
            <NewsletterSignup />
          </div>
        </div>
        {cols.map((col) => (
          <nav key={col.heading} aria-labelledby={`footer-${col.heading}`}>
            <h2 id={`footer-${col.heading}`} className="text-sm font-semibold">
              {col.heading}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--muted)] transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[var(--muted)] sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} 24Asia · Singapore · Migrant-led volunteer
            group
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <li>
              <Link href="/policies" className="hover:text-brand-700">
                Privacy &amp; policies
              </Link>
            </li>
            <li>
              <Link href="/about/contact" className="hover:text-brand-700">
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-brand-700">
                {tc("search")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
