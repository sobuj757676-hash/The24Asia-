import { can, type Permission, type RoleKey } from "./permissions";

/**
 * Which admin destinations each permission unlocks. Used to filter the sidebar
 * server-side so staff never see a section they'd be denied on (avoids the
 * "click → access denied" dead end).
 */
const ADMIN_ROUTE_PERMISSION: Record<string, Permission> = {
  "/admin/reports": "audit:read",
  "/admin/programs": "course:manage",
  "/admin/content": "content:read",
  "/admin/volunteers": "volunteer:review",
  "/admin/people": "person:read_scoped",
  "/admin/users": "user:manage",
  "/admin/events": "event:manage",
  "/admin/shop": "event:manage",
  "/admin/finance": "donation:manage",
  "/admin/assets": "event:manage",
  "/admin/support": "support:handle",
  "/admin/career": "content:publish",
  "/admin/community": "moderation:handle",
  "/admin/comms": "content:publish",
  "/admin/governance": "audit:read",
  "/admin/audit": "audit:read",
  "/admin/flags": "feature_flag:manage",
};

export function allowedAdminHrefs(roles: RoleKey[]): string[] {
  const allowed = ["/admin"]; // overview is available to all staff
  for (const [href, permission] of Object.entries(ADMIN_ROUTE_PERMISSION)) {
    if (can(roles, permission)) allowed.push(href);
  }
  return allowed;
}
