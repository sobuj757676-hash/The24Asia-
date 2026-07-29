/**
 * Grant a role to a user by email (bootstrap an admin, etc.).
 * Usage: pnpm tsx --env-file=.env scripts/grant-role.ts <email> <role>
 * Roles: admin, coordinator, finance, safeguarding_lead, publisher, ...
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { user, person, roleAssignment } from "../src/db/schema";

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !role) {
    console.error("Usage: grant-role.ts <email> <role>");
    process.exit(1);
  }

  const u = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (!u[0]) {
    console.error(`No user with email ${email}. Sign in once first.`);
    process.exit(1);
  }

  let p = await db
    .select({ id: person.id })
    .from(person)
    .where(eq(person.userId, u[0].id))
    .limit(1);
  if (!p[0]) {
    const [created] = await db
      .insert(person)
      .values({ userId: u[0].id, displayName: u[0].name })
      .returning({ id: person.id });
    p = [created];
  }

  await db.insert(roleAssignment).values({
    personId: p[0].id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    role: role as any,
  });

  console.log(`Granted role "${role}" to ${email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
