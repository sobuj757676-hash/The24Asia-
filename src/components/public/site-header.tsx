"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, LogIn, Search, Heart, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "learn", href: "/learn" },
  { key: "volunteer", href: "/volunteer" },
  { key: "events", href: "/events" },
  { key: "support", href: "/support" },
  { key: "impact", href: "/impact" },
  { key: "about", href: "/about" },
] as const;

export function SiteHeader({ isAuthed }: { isAuthed: boolean }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  // The menu remembers which route it was opened on, so navigating anywhere
  // closes it automatically without an effect-driven state sync.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  // Escape closes the menu, and background scroll is locked while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedOn(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-[var(--card)]/85 backdrop-blur-md dark:border-ink-700/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg font-extrabold text-brand-700"
          aria-label={`${tc("appName")} — ${tc("goHome")}`}
        >
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
            24
          </span>
          <span className="text-lg">24Asia</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-brand-700 dark:text-brand-300"
                        : "text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800",
                    )}
                  >
                    {t(item.key)}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            aria-label={tc("search")}
            className="grid size-11 place-items-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <Search className="size-5" aria-hidden />
          </Link>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex">
            <Link href="/donate">
              <Heart className="size-4" aria-hidden />
              {t("donate")}
            </Link>
          </Button>
          {isAuthed ? (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" aria-hidden />
                {t("account")}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/sign-in">
                <LogIn className="size-4" aria-hidden /> {tc("signIn")}
              </Link>
            </Button>
          )}
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-ink-100 lg:hidden dark:text-ink-200 dark:hover:bg-ink-800"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? tc("close") : tc("menu")}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t bg-[var(--card)] lg:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-3">
          <ul className="grid gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                        : "hover:bg-ink-100 dark:hover:bg-ink-800",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 grid gap-2 border-t pt-3">
            <Button asChild variant="primary">
              <Link href="/donate" onClick={() => setOpen(false)}>
                <Heart className="size-4" aria-hidden />
                {t("donate")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href={isAuthed ? "/dashboard" : "/sign-in"}
                onClick={() => setOpen(false)}
              >
                {isAuthed ? (
                  <>
                    <LayoutDashboard className="size-4" aria-hidden />
                    {t("account")}
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" aria-hidden />
                    {tc("signIn")}
                  </>
                )}
              </Link>
            </Button>
            <div className="pt-1">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
