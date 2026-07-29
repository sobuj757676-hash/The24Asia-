import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
      ],
    },
  ];

  return (
    <footer className="mt-8 border-t bg-[var(--card)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-6">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 font-extrabold text-brand-700">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
              24
            </span>
            24Asia
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">{tc("tagline")}</p>
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Newsletter
            </p>
            <NewsletterSignup />
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.heading}>
            <h2 className="text-sm font-semibold">{col.heading}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--muted)] hover:text-brand-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} 24Asia · Singapore · Migrant-led volunteer group
      </div>
    </footer>
  );
}
