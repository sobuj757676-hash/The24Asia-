import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/misc";
import { SignOutButton } from "./sign-out-button";
import { getCurrentUser } from "@/lib/auth/session";
import { availablePanels } from "@/lib/auth/panels";

type NavItem = { href: string; label: string };

/**
 * Shared shell for authenticated portals (learner/volunteer) and admin.
 * Left rail on desktop, top bar on mobile (PRD 7.6).
 */
export async function PortalShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const tc = await getTranslations("common");
  const user = await getCurrentUser();
  const panels = user ? availablePanels(user.roles) : [];
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <header className="border-b bg-[var(--card)]">
        <Container className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-700">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
              24
            </span>
            <span className="hidden sm:inline">{title}</span>
          </Link>
          <div className="flex items-center gap-2">
            {panels.length > 1 && (
              <nav aria-label="Switch panel" className="hidden items-center gap-1 sm:flex">
                {panels.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--muted)] hover:bg-ink-100 hover:text-brand-700 dark:hover:bg-ink-800"
                  >
                    {p.label}
                  </Link>
                ))}
              </nav>
            )}
            <SignOutButton label={tc("signOut")} />
          </div>
        </Container>
      </header>

      {panels.length > 1 && (
        <div className="border-b bg-[var(--card)] sm:hidden">
          <Container>
            <nav aria-label="Switch panel" className="flex gap-2 overflow-x-auto py-2">
              {panels.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="whitespace-nowrap rounded-full border px-3 py-1 text-sm"
                >
                  {p.label}
                </Link>
              ))}
            </nav>
          </Container>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav aria-label="Portal">
            <ul className="space-y-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main id="main" className="min-w-0 flex-1">
          {/* Mobile horizontal nav */}
          <nav
            aria-label="Portal"
            className="mb-4 flex gap-2 overflow-x-auto lg:hidden"
          >
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="whitespace-nowrap rounded-full border px-3 py-1.5 text-sm"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
