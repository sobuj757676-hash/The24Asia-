/**
 * Seed demo login accounts (with passwords) + role-specific demo data so every
 * panel can be tested. Idempotent.
 *
 * Run: pnpm tsx --env-file=.env scripts/seed-users.ts
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import * as s from "../src/db/schema";

const PASSWORD = "24AsiaDemo!";

// Minimal auth instance (no next-cookies plugin) so signUp works in a script.
const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: s.user, session: s.session, account: s.account, verification: s.verification },
    usePlural: false,
  }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
});

async function createUser(email: string, name: string): Promise<string> {
  const existing = await db.select({ id: s.user.id }).from(s.user).where(eq(s.user.email, email)).limit(1);
  if (existing[0]) return existing[0].id;
  const res = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name } });
  // mark verified for convenience
  await db.update(s.user).set({ emailVerified: true }).where(eq(s.user.id, res.user.id));
  return res.user.id;
}

async function getOrCreatePerson(userId: string, displayName: string): Promise<string> {
  const existing = await db.select({ id: s.person.id }).from(s.person).where(eq(s.person.userId, userId)).limit(1);
  if (existing[0]) return existing[0].id;
  const [row] = await db
    .insert(s.person)
    .values({ userId, displayName, ageAttestedAdult: true })
    .returning({ id: s.person.id });
  return row.id;
}

async function grant(personId: string, role: string) {
  const existing = await db
    .select({ id: s.roleAssignment.id })
    .from(s.roleAssignment)
    .where(and(eq(s.roleAssignment.personId, personId), eq(s.roleAssignment.role, role as never)))
    .limit(1);
  if (!existing[0]) await db.insert(s.roleAssignment).values({ personId, role: role as never });
}

function code() {
  return `24A-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

async function main() {
  console.log("Seeding demo accounts (password for all: " + PASSWORD + ")…");

  // --- Admin ---
  const adminU = await createUser("admin@24asia.test", "Aisha Admin");
  const adminP = await getOrCreatePerson(adminU, "Aisha Admin");
  await grant(adminP, "admin");

  // --- Coordinator (staff, scoped) ---
  const coordU = await createUser("coordinator@24asia.test", "Kumar Coordinator");
  const coordP = await getOrCreatePerson(coordU, "Kumar Coordinator");
  await grant(coordP, "coordinator");

  // --- Volunteer ---
  const volU = await createUser("volunteer@24asia.test", "Rahim Volunteer");
  const volP = await getOrCreatePerson(volU, "Rahim Volunteer");
  await grant(volP, "volunteer");

  // --- Learner / member ---
  const learnU = await createUser("learner@24asia.test", "Maya Learner");
  const learnP = await getOrCreatePerson(learnU, "Maya Learner");
  await grant(learnP, "member");

  // --- Partner contact ---
  const partU = await createUser("partner@24asia.test", "Priya Partner");
  const partP = await getOrCreatePerson(partU, "Priya Partner");
  await grant(partP, "partner_contact");

  // Lookups
  const [excel] = await db.select().from(s.cohort).where(eq(s.cohort.code, "EXCEL-2026-B12")).limit(1);
  const [speak] = await db.select().from(s.cohort).where(eq(s.cohort.code, "SPEAK-2026-B04")).limit(1);
  const opps = await db.select().from(s.opportunity).limit(1);
  const events = await db.select().from(s.event).orderBy(s.event.startsAt).limit(1);
  const partners = await db.select().from(s.partner).limit(1);

  // --- Learner demo data ---
  if (excel) {
    const enr = await db
      .insert(s.enrollment)
      .values({ cohortId: excel.id, personId: learnP, status: "completed", completedAt: new Date() })
      .onConflictDoNothing()
      .returning({ id: s.enrollment.id });
    const enrollmentId =
      enr[0]?.id ??
      (await db
        .select({ id: s.enrollment.id })
        .from(s.enrollment)
        .where(and(eq(s.enrollment.cohortId, excel.id), eq(s.enrollment.personId, learnP)))
        .limit(1))[0]?.id;

    // certificate
    if (enrollmentId) {
      const hasCert = await db
        .select({ id: s.certificate.id })
        .from(s.certificate)
        .where(eq(s.certificate.enrollmentId, enrollmentId))
        .limit(1);
      if (!hasCert[0]) {
        await db.insert(s.certificate).values({
          enrollmentId,
          personId: learnP,
          courseTitle: "Microsoft Excel",
          recipientName: "Maya Learner",
          verificationCode: code(),
        });
      }
    }

    // attendance on first session
    const [sess] = await db.select().from(s.cohortSession).where(eq(s.cohortSession.cohortId, excel.id)).orderBy(s.cohortSession.sequence).limit(1);
    if (sess) {
      await db
        .insert(s.attendance)
        .values({ sessionId: sess.id, personId: learnP, status: "present", recordedAt: new Date() })
        .onConflictDoNothing();
    }
  }

  // pending course application (for admin review queue)
  if (speak) {
    await db
      .insert(s.courseApplication)
      .values({ cohortId: speak.id, personId: learnP, status: "submitted" })
      .onConflictDoNothing();
  }

  // event registration
  if (events[0]) {
    await db
      .insert(s.eventRegistration)
      .values({ eventId: events[0].id, personId: learnP, status: "registered" })
      .onConflictDoNothing();
  }

  // welcome notification
  await db.insert(s.notification).values({
    personId: learnP,
    channel: "in_app",
    templateKey: "welcome",
    title: "Welcome to 24Asia 👋",
    body: "Explore free courses and events in your account.",
    deliveredAt: new Date(),
  });

  // pending volunteer application from learner (for admin volunteer review)
  if (opps[0]) {
    await db.insert(s.volunteerApplication).values({
      opportunityId: opps[0].id,
      personId: learnP,
      status: "submitted",
      motivation: "I'd love to help fellow migrants learn digital skills.",
    });
  }

  // --- Volunteer demo data ---
  const hasProfile = await db.select({ id: s.volunteerProfile.id }).from(s.volunteerProfile).where(eq(s.volunteerProfile.personId, volP)).limit(1);
  if (!hasProfile[0]) {
    await db.insert(s.volunteerProfile).values({
      personId: volP,
      standing: "active",
      skills: ["Excel", "Teaching"],
      languages: ["English", "Bengali"],
      availability: ["Weekends"],
      team: "Training",
      totalHours: "12",
      handbookAcknowledgedAt: new Date(),
    });
    await db.insert(s.timeEntry).values([
      { personId: volP, hours: "12", activityDate: new Date(), note: "Weekend Excel class", approved: true, approvedAt: new Date() },
      { personId: volP, hours: "3", activityDate: new Date(), note: "Beach cleanup (pending)", approved: false },
    ]);
    await db.insert(s.recognition).values({ personId: volP, kind: "milestone", label: "First 10 hours served" });
    if (events[0]) {
      await db.insert(s.shiftAssignment).values({
        personId: volP,
        eventId: events[0].id,
        role: "Registration desk",
        startsAt: events[0].startsAt,
        status: "accepted",
      });
    }
    await db.insert(s.expenseClaim).values({
      personId: volP,
      amountCents: 1500,
      category: "transport",
      description: "Bus fare to training venue",
      status: "submitted",
    });
  }

  // --- Partner demo data ---
  if (partners[0]) {
    await db
      .insert(s.partnerContact)
      .values({ partnerId: partners[0].id, personId: partP, title: "Programs Manager", isPrimary: true })
      .onConflictDoNothing();
    await db.insert(s.opportunityListing).values([
      {
        partnerId: partners[0].id,
        title: "Admin Assistant (via " + partners[0].name + ")",
        description: "Entry-level office role for a graduate of our training.",
        roleType: "job",
        compensation: "As per MOM guidelines",
        verified: true,
        published: true,
      },
      {
        partnerId: partners[0].id,
        title: "Warehouse Trainee (under review)",
        roleType: "training",
        verified: false,
        published: false,
      },
    ]);
    // agreement
    await db.insert(s.partnerAgreement).values({
      partnerId: partners[0].id,
      title: "Employer partnership MOU 2026",
      type: "MOU",
      effectiveAt: new Date(),
    });
  }

  console.log("\nDemo accounts ready:\n");
  console.log("  Admin panel        admin@24asia.test");
  console.log("  Staff (coordinator) coordinator@24asia.test");
  console.log("  Volunteer panel    volunteer@24asia.test");
  console.log("  Learner account    learner@24asia.test");
  console.log("  Partner portal     partner@24asia.test");
  console.log(`\n  Password (all):    ${PASSWORD}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
