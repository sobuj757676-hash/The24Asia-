"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GraduationCap, CalendarDays, HandHeart, LifeBuoy, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mobile 5-item bottom navigation (PRD 7.6). */
const ITEMS = [
  { key: "home", href: "/", Icon: Home, label: "appName" },
  { key: "learn", href: "/learn", Icon: GraduationCap, label: "learn" },
  { key: "events", href: "/events", Icon: CalendarDays, label: "events" },
  { key: "volunteer", href: "/volunteer", Icon: HandHeart, label: "volunteer" },
  { key: "support", href: "/support", Icon: LifeBuoy, label: "support" },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--card)] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ key, href, Icon, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
                  active ? "text-brand-700" : "text-ink-500",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span>{key === "home" ? tc("appName") : t(label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
