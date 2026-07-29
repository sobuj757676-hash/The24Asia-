"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X, LogIn, Search } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-[var(--card)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-700">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
            24
          </span>
          <span className="text-lg">24Asia</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label={tc("search")}
            className="grid size-11 place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <Search className="size-5" aria-hidden />
          </Link>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex">
            <Link href="/donate">{t("donate")}</Link>
          </Button>
          {isAuthed ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/account">{t("account")}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">
                <LogIn className="size-4" aria-hidden /> {tc("signIn")}
              </Link>
            </Button>
          )}
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl hover:bg-ink-100 lg:hidden dark:hover:bg-ink-800"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? tc("close") : tc("menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "border-t lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-3">
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <LanguageSwitcher />
            <Button asChild variant="primary" size="sm">
              <Link href="/donate" onClick={() => setOpen(false)}>
                {t("donate")}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
