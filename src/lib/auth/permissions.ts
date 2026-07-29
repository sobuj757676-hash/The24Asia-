/**
 * RBAC + ABAC model (PRD 11). A role grants maximum capability; contextual
 * scope (team/program/cohort/locale) further restricts at the query layer.
 *
 * Permissions are expressed as "resource:action" strings. This keeps checks
 * declarative and auditable (PRD 10.8: transitions permission-checked server-side).
 */

export type RoleKey =
  | "guest"
  | "member"
  | "volunteer_applicant"
  | "volunteer"
  | "trainer"
  | "mentor"
  | "coordinator"
  | "support_coordinator"
  | "moderator"
  | "safeguarding_lead"
  | "content_author"
  | "translator"
  | "publisher"
  | "partner_contact"
  | "finance"
  | "auditor"
  | "admin"
  | "super_admin";

export type Permission =
  // content
  | "content:read"
  | "content:draft"
  | "content:review"
  | "content:translate"
  | "content:publish"
  // learning
  | "course:read"
  | "course:manage"
  | "cohort:manage"
  | "attendance:mark"
  | "certificate:issue"
  | "application:review"
  // events
  | "event:read"
  | "event:manage"
  | "registration:manage"
  // volunteering
  | "opportunity:manage"
  | "volunteer:review"
  | "volunteer:hours_approve"
  // crm / people
  | "person:read_scoped"
  | "person:read_all"
  // support (restricted)
  | "support:handle"
  | "safeguarding:access"
  // fundraising
  | "donation:manage"
  | "refund:approve"
  // governance / platform
  | "audit:read"
  | "user:manage"
  | "role:grant"
  | "feature_flag:manage"
  | "impersonate";

const NONE: Permission[] = [];

/**
 * Base capability per role. `admin`/`super_admin` are handled specially and
 * do NOT implicitly get safeguarding access (PRD 11.2 separation of duty).
 */
const ROLE_PERMISSIONS: Record<RoleKey, Permission[]> = {
  guest: NONE,
  member: ["content:read", "course:read", "event:read"],
  volunteer_applicant: ["content:read", "course:read", "event:read"],
  volunteer: [
    "content:read",
    "course:read",
    "event:read",
    "attendance:mark", // only for assigned cohorts (ABAC scope enforced in query)
  ],
  trainer: [
    "content:read",
    "course:read",
    "event:read",
    "attendance:mark",
    "person:read_scoped",
  ],
  mentor: ["content:read", "person:read_scoped"],
  coordinator: [
    "content:read",
    "course:read",
    "course:manage",
    "cohort:manage",
    "application:review",
    "attendance:mark",
    "certificate:issue",
    "event:read",
    "event:manage",
    "registration:manage",
    "opportunity:manage",
    "volunteer:review",
    "volunteer:hours_approve",
    "person:read_scoped",
  ],
  support_coordinator: ["content:read", "support:handle", "person:read_scoped"],
  moderator: ["content:read"],
  safeguarding_lead: ["support:handle", "safeguarding:access"],
  content_author: ["content:read", "content:draft", "content:translate"],
  translator: ["content:read", "content:translate"],
  publisher: [
    "content:read",
    "content:draft",
    "content:review",
    "content:publish",
  ],
  partner_contact: NONE,
  finance: ["donation:manage", "refund:approve"],
  auditor: ["audit:read", "content:read"],
  admin: [
    "content:read",
    "content:draft",
    "content:review",
    "content:publish",
    "course:read",
    "course:manage",
    "cohort:manage",
    "application:review",
    "attendance:mark",
    "certificate:issue",
    "event:read",
    "event:manage",
    "registration:manage",
    "opportunity:manage",
    "volunteer:review",
    "volunteer:hours_approve",
    "person:read_scoped",
    "person:read_all",
    "donation:manage",
    "audit:read",
    "user:manage",
    "role:grant",
    "feature_flag:manage",
  ],
  // Emergency limited control; still NOT safeguarding by default (just-in-time).
  super_admin: [
    "content:read",
    "content:publish",
    "course:manage",
    "cohort:manage",
    "event:manage",
    "opportunity:manage",
    "person:read_all",
    "donation:manage",
    "refund:approve",
    "audit:read",
    "user:manage",
    "role:grant",
    "feature_flag:manage",
    "impersonate",
  ],
};

export function permissionsForRoles(roles: RoleKey[]): Set<Permission> {
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) set.add(p);
  }
  return set;
}

export function can(roles: RoleKey[], permission: Permission): boolean {
  return permissionsForRoles(roles).has(permission);
}

/** Roles that may access any staff/admin surface at all. */
export const STAFF_ROLES: RoleKey[] = [
  "trainer",
  "mentor",
  "coordinator",
  "support_coordinator",
  "moderator",
  "safeguarding_lead",
  "content_author",
  "translator",
  "publisher",
  "finance",
  "auditor",
  "admin",
  "super_admin",
];

export function isStaff(roles: RoleKey[]): boolean {
  return roles.some((r) => STAFF_ROLES.includes(r));
}
