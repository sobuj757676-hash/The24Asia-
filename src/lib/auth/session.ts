import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "@/db";
import { person, roleAssignment } from "@/db/schema";
import type { Permission, RoleKey } from "./permissions";
import { can, isStaff } from "./permissions";

export type CurrentUser = {
  userId: string;
  personId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  preferredLocale: string;
  roles: RoleKey[];
  /** ABAC scopes per role assignment (teamId/programId/cohortId/locale). */
  scopes: { role: RoleKey; scope: Record<string, string> }[];
};

/**
 * Resolves the authenticated user together with their app `person` record and
 * role assignments. Cached per request (React cache) so repeated calls in a
 * render tree hit the DB once.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const rows = await db
    .select({
      personId: person.id,
      displayName: person.displayName,
      preferredLocale: person.preferredLocale,
    })
    .from(person)
    .where(eq(person.userId, session.user.id))
    .limit(1);

  const p = rows[0];
  if (!p) {
    // Auth user exists but no person profile yet (should be created on signup).
    return {
      userId: session.user.id,
      personId: "",
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      displayName: null,
      preferredLocale: "en",
      roles: ["member"],
      scopes: [],
    };
  }

  const assignments = await db
    .select({ role: roleAssignment.role, scope: roleAssignment.scope })
    .from(roleAssignment)
    .where(eq(roleAssignment.personId, p.personId));

  const roles = assignments.length
    ? (assignments.map((a) => a.role) as RoleKey[])
    : (["member"] as RoleKey[]);

  return {
    userId: session.user.id,
    personId: p.personId,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    displayName: p.displayName,
    preferredLocale: p.preferredLocale,
    roles,
    scopes: assignments.map((a) => ({
      role: a.role as RoleKey,
      scope: (a.scope ?? {}) as Record<string, string>,
    })),
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError("UNAUTHENTICATED");
  return u;
}

export async function requirePermission(
  permission: Permission,
): Promise<CurrentUser> {
  const u = await requireUser();
  if (!can(u.roles, permission)) throw new AuthError("FORBIDDEN");
  return u;
}

export async function requireStaff(): Promise<CurrentUser> {
  const u = await requireUser();
  if (!isStaff(u.roles)) throw new AuthError("FORBIDDEN");
  return u;
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
    this.name = "AuthError";
  }
}
