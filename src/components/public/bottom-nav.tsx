"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GraduationCap, CalendarDays, HandHeart, LifeBuoy, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mobile 5-item bottom navigation (PRD 7.6). */
const ITEMS = [
  { key: "home", href: "/", Icon: Home },
  { key: "learn", href: "/learn", Icon: GraduationCap },
  { key: "events", href: "/events", Icon: CalendarDays },
  { key: "volunteer", href: "/volunteer", Icon: HandHeart },
  { key: "support", href: "/support", Icon: LifeBuoy },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ key, href, Icon }) => {
          // Exact match for home; prefix match with a boundary elsewhere so
          // e.g. /support never lights up for an unrelated /supporters route.
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-ink-500 dark:text-ink-400",
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand-600"
                  />
                )}
                <Icon className="size-5" aria-hidden />
                <span className="max-w-full truncate px-0.5">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
