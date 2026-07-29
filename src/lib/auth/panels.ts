import type { CurrentUser } from "./session";
import { isStaff, type RoleKey } from "./permissions";

export type Panel = { href: string; label: string };

/** Panels a user can access, richest first (PRD role-scoped surfaces). */
export function availablePanels(roles: RoleKey[]): Panel[] {
  const panels: Panel[] = [];
  if (isStaff(roles)) panels.push({ href: "/admin", label: "Admin" });
  if (roles.includes("partner_contact"))
    panels.push({ href: "/partner-portal", label: "Partner portal" });
  if (roles.includes("volunteer") || roles.includes("trainer") || roles.includes("mentor"))
    panels.push({ href: "/volunteer-portal", label: "Volunteer hub" });
  panels.push({ href: "/account", label: "My account" });
  return panels;
}

/** Where to send a user immediately after sign-in. */
export function landingPath(user: Pick<CurrentUser, "roles">): string {
  return availablePanels(user.roles)[0]?.href ?? "/account";
}
