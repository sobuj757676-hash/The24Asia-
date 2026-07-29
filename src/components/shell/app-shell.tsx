"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BarChart3, GraduationCap, FileText, CalendarDays,
  HandHeart, Users, ShoppingBag, Wallet, LifeBuoy, Briefcase,
  MessagesSquare, Megaphone, ShieldCheck, Boxes, UserCog, ScrollText,
  Flag, BookOpen, ClipboardCheck, Award, Bell, UserRound, SlidersHorizontal,
  Lock, ClipboardList, Clock, Receipt, TriangleAlert, Menu, X, LogOut,
  ChevronDown, FolderKanban,
} from "lucide-react";

type PanelId = "admin" | "account" | "volunteer" | "partner";
type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type Group = { heading?: string; items: Item[] };

const NAV: Record<PanelId, Group[]> = {
  admin: [
    { items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/reports", label: "Reports & impact", icon: BarChart3 },
    ] },
    { heading: "Programs", items: [
      { href: "/admin/programs", label: "Programs & learning", icon: GraduationCap },
      { href: "/admin/content", label: "Content & CMS", icon: FileText },
    ] },
    { heading: "People", items: [
      { href: "/admin/volunteers", label: "Volunteers", icon: HandHeart },
      { href: "/admin/people", label: "People (CRM)", icon: Users },
      { href: "/admin/users", label: "Users & roles", icon: UserCog },
    ] },
    { heading: "Operations", items: [
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/shop", label: "Shop", icon: ShoppingBag },
      { href: "/admin/finance", label: "Finance", icon: Wallet },
      { href: "/admin/assets", label: "Assets & inventory", icon: Boxes },
    ] },
    { heading: "Community & support", items: [
      { href: "/admin/support", label: "Support & referrals", icon: LifeBuoy },
      { href: "/admin/career", label: "Career & mentorship", icon: Briefcase },
      { href: "/admin/community", label: "Community", icon: MessagesSquare },
      { href: "/admin/comms", label: "Communications", icon: Megaphone },
    ] },
    { heading: "Governance", items: [
      { href: "/admin/governance", label: "Governance", icon: ShieldCheck },
      { href: "/admin/audit", label: "Audit log", icon: ScrollText },
      { href: "/admin/flags", label: "Feature flags", icon: Flag },
    ] },
  ],
  account: [
    { items: [
      { href: "/account", label: "My learning", icon: LayoutDashboard },
    ] },
    { heading: "Learning", items: [
      { href: "/account/courses", label: "My courses", icon: BookOpen },
      { href: "/account/attendance", label: "Attendance", icon: ClipboardCheck },
      { href: "/account/materials", label: "Materials", icon: FileText },
      { href: "/account/assessments", label: "Assessments", icon: GraduationCap },
      { href: "/account/certificates", label: "Certificates", icon: Award },
    ] },
    { heading: "Activities", items: [
      { href: "/account/events", label: "My events", icon: CalendarDays },
      { href: "/account/career", label: "Career", icon: Briefcase },
      { href: "/account/support", label: "Support", icon: LifeBuoy },
    ] },
    { heading: "Account", items: [
      { href: "/account/notifications", label: "Notifications", icon: Bell },
      { href: "/account/profile", label: "Profile", icon: UserRound },
      { href: "/account/preferences", label: "Preferences", icon: SlidersHorizontal },
      { href: "/account/privacy", label: "Privacy & data", icon: Lock },
    ] },
  ],
  volunteer: [
    { items: [
      { href: "/volunteer-portal", label: "Dashboard", icon: LayoutDashboard },
      { href: "/volunteer-portal/profile", label: "My profile", icon: UserRound },
    ] },
    { heading: "Activity", items: [
      { href: "/volunteer-portal/applications", label: "Applications", icon: ClipboardList },
      { href: "/volunteer-portal/shifts", label: "Shifts", icon: CalendarDays },
      { href: "/volunteer-portal/hours", label: "Hours", icon: Clock },
      { href: "/volunteer-portal/expenses", label: "Expenses", icon: Receipt },
    ] },
    { heading: "Safety", items: [
      { href: "/volunteer-portal/report", label: "Report a concern", icon: TriangleAlert },
    ] },
  ],
  partner: [
    { items: [
      { href: "/partner-portal", label: "Overview", icon: FolderKanban },
    ] },
  ],
};

const ACCENT: Record<PanelId, { badge: string; active: string; icon: string; ring: string }> = {
  admin: { badge: "bg-brand-600", active: "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200", icon: "text-brand-600", ring: "text-brand-700" },
  account: { badge: "bg-brand-600", active: "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200", icon: "text-brand-600", ring: "text-brand-700" },
  volunteer: { badge: "bg-accent-500", active: "bg-accent-500/10 text-accent-600 dark:text-accent-400", icon: "text-accent-500", ring: "text-accent-600" },
  partner: { badge: "bg-indigo-600", active: "bg-indigo-50 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200", icon: "text-indigo-600", ring: "text-indigo-700" },
};

export function AppShell({
  panel,
  title,
  user,
  panels,
  children,
}: {
  panel: PanelId;
  title: string;
  user: { name: string; email: string };
  panels: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const accent = ACCENT[panel];
  const groups = NAV[panel];

  const isActive = (href: string) =>
    href === `/${panel === "account" ? "account" : panel === "volunteer" ? "volunteer-portal" : panel === "partner" ? "partner-portal" : "admin"}`
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/") || (pathname === href);

  const initials = (user.name || user.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <span className={cn("grid size-9 place-items-center rounded-xl font-extrabold text-white", accent.badge)}>24</span>
        <div className="leading-tight">
          <p className="text-sm font-extrabold">24Asia</p>
          <p className="text-xs text-[var(--muted)]">{title}</p>
        </div>
      </div>
      <nav aria-label={title} className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.heading && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {g.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(it.href);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setDrawer(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? accent.active
                          : "text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active ? accent.icon : "text-ink-400")} />
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t p-3">
        <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--muted)] hover:bg-ink-100 dark:hover:bg-ink-800">
          ← Public site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-[var(--card)] lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--card)] shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
              className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <X className="size-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-[var(--card)]/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawer(true)}
            className="grid size-10 place-items-center rounded-xl hover:bg-ink-100 lg:hidden dark:hover:bg-ink-800"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="truncate text-base font-bold sm:text-lg">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            {/* Panel switcher */}
            {panels.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  Switch <ChevronDown className="size-4" />
                </button>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} aria-hidden />
                    <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border bg-[var(--card)] py-1 shadow-lg">
                      {panels.map((p) => (
                        <Link
                          key={p.href}
                          href={p.href}
                          onClick={() => setMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-ink-100 dark:hover:bg-ink-800"
                        >
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* User + sign out */}
            <div className="flex items-center gap-2">
              <span
                className={cn("grid size-9 place-items-center rounded-full text-sm font-bold text-white", accent.badge)}
                title={user.email}
              >
                {initials}
              </span>
              <button
                type="button"
                aria-label="Sign out"
                onClick={async () => {
                  if (typeof caches !== "undefined") {
                    try {
                      const keys = await caches.keys();
                      await Promise.all(keys.map((k) => caches.delete(k)));
                    } catch { /* ignore */ }
                  }
                  await authClient.signOut();
                  router.push("/");
                  router.refresh();
                }}
                className="grid size-10 place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
