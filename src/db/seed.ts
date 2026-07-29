/**
 * Seed baseline data (PRD-aligned). Idempotent-ish: clears the demo content
 * tables then inserts a representative dataset drawn from the public 24asia.org
 * site (courses, events, impact metrics, services, feature flags).
 *
 * Run: pnpm db:seed
 */
import { db } from "./index";
import {
  course,
  cohort,
  cohortSession,
  event,
  opportunity,
  impactMetric,
  service,
  featureFlag,
  liveShowEpisode,
  partner,
  award,
  campaign,
  product,
  productVariant,
  group,
  opportunityListing,
  learningPath,
  learningPathStep,
  assessment,
  assessmentQuestion,
  policy,
} from "./schema";
import { eq, sql } from "drizzle-orm";
import { FLAGS } from "@/lib/flag-keys";

function daysFromNow(n: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding 24Asia baseline data…");

  // Idempotent reset of demo content (CASCADE clears dependent rows).
  // Auth/person/role data is preserved.
  await db.execute(sql`
    TRUNCATE TABLE
      course, event, opportunity, product, "group", learning_path,
      assessment, impact_metric, service, partner, award,
      live_show_episode, campaign, opportunity_listing, policy
    RESTART IDENTITY CASCADE
  `);

  // ---- Feature flags (all high-risk capabilities OFF, PRD 30.2) ----
  await db
    .insert(featureFlag)
    .values([
      {
        key: FLAGS.DONATIONS_PAYMENT,
        description: "Online one-time donation payment",
        enabled: false,
        gateReason: "Pending charity/IPC + tax status and payment vendor (PRD 30.2).",
      },
      {
        key: FLAGS.RECURRING_DONATIONS,
        description: "Recurring donation plans",
        enabled: false,
        gateReason: "Requires FUND-006 donor controls first.",
      },
      {
        key: FLAGS.MERCH_PAYMENT,
        description: "Merchandise payment/checkout",
        enabled: false,
        gateReason: "Requires tax/fulfilment/refund review (MER-006).",
      },
      {
        key: FLAGS.SUPPORT_INTAKE,
        description: "Public private-contact/support intake form",
        enabled: false,
        gateReason: "Requires named trained staffed coverage + SLAs (SUP gate).",
      },
      {
        key: FLAGS.COMMUNITY,
        description: "Moderated community features",
        enabled: false,
        gateReason: "Phase 3; requires moderators + safeguarding (COM gate).",
      },
      {
        key: FLAGS.PUSH_NOTIFICATIONS,
        description: "Web push notifications",
        enabled: false,
        gateReason: "P1; requires VAPID keys + consent tooling.",
      },
    ])
    .onConflictDoNothing();

  // ---- Impact metrics (every number has definition + source + as-of) ----
  await db.delete(impactMetric);
  await db.insert(impactMetric).values([
    {
      key: "migrants_trained",
      label: "Trained",
      value: "5300+",
      numericValue: 5300,
      definition:
        "Unique migrant learners who completed at least one 24Asia training course.",
      source: "Training records (cohort completion).",
      asOf: new Date(),
      displayOrder: 1,
      publishedPublicly: true,
    },
    {
      key: "active_students",
      label: "Active students",
      value: "2500+",
      numericValue: 2500,
      definition: "Learners with an active enrolment in the current period.",
      source: "Enrolment records.",
      asOf: new Date(),
      displayOrder: 2,
      publishedPublicly: true,
    },
    {
      key: "volunteers",
      label: "Volunteers",
      value: "350+",
      numericValue: 350,
      definition: "Approved active volunteers.",
      source: "Volunteer register.",
      asOf: new Date(),
      displayOrder: 3,
      publishedPublicly: true,
    },
    {
      key: "blood_bags",
      label: "Blood bags donated",
      value: "1012",
      numericValue: 1012,
      definition: "Total blood bags collected across 24Asia donation drives.",
      source: "Blood donation drive records.",
      asOf: new Date(),
      displayOrder: 4,
      publishedPublicly: true,
    },
    {
      key: "episodes",
      label: "Live show episodes",
      value: "154",
      numericValue: 154,
      definition: "Live show episodes produced.",
      source: "Live show archive.",
      asOf: new Date(),
      displayOrder: 5,
      publishedPublicly: true,
    },
    {
      key: "batches",
      label: "Training batches",
      value: "35",
      numericValue: 35,
      definition: "Completed training batches.",
      source: "Cohort records.",
      asOf: new Date(),
      displayOrder: 6,
      publishedPublicly: true,
    },
  ]);

  // ---- Courses (from the current 24asia catalog) ----
  await db.delete(course);
  const courseData = [
    {
      slug: "microsoft-word",
      title: "Microsoft Word",
      category: "digital_literacy",
      summary: "Create and format professional documents with confidence.",
      durationLabel: "6 sessions",
      outcomes: ["Format documents", "Tables & templates", "Mail merge basics"],
      displayOrder: 1,
    },
    {
      slug: "microsoft-excel",
      title: "Microsoft Excel",
      category: "digital_literacy",
      summary: "Organise data, use formulas and build simple spreadsheets.",
      durationLabel: "8 sessions",
      outcomes: ["Formulas & functions", "Charts", "Data cleanup"],
      displayOrder: 2,
    },
    {
      slug: "microsoft-powerpoint",
      title: "Microsoft PowerPoint",
      category: "digital_literacy",
      summary: "Design clear, engaging presentations.",
      durationLabel: "4 sessions",
      outcomes: ["Slide design", "Transitions", "Presenting tips"],
      displayOrder: 3,
    },
    {
      slug: "autocad",
      title: "AutoCAD",
      category: "creative",
      summary: "Introduction to 2D drafting for construction and engineering.",
      durationLabel: "10 sessions",
      prerequisites: "Basic computer skills",
      outcomes: ["2D drafting", "Layers", "Dimensioning"],
      displayOrder: 4,
    },
    {
      slug: "graphic-design",
      title: "Graphic Design",
      category: "creative",
      summary: "Learn design fundamentals and popular design tools.",
      durationLabel: "8 sessions",
      outcomes: ["Design principles", "Typography", "Poster design"],
      displayOrder: 5,
    },
    {
      slug: "video-editing",
      title: "Video Editing",
      category: "creative",
      summary: "Edit and produce short videos for social media.",
      durationLabel: "6 sessions",
      outcomes: ["Cutting & trimming", "Transitions", "Export for social"],
      displayOrder: 6,
    },
    {
      slug: "public-speaking",
      title: "Public Speaking",
      category: "communication",
      summary: "Build confidence to speak clearly in front of others.",
      durationLabel: "5 sessions",
      outcomes: ["Structure a talk", "Body language", "Handling nerves"],
      displayOrder: 7,
    },
    {
      slug: "workplace-safety-health",
      title: "Workplace Safety & Health",
      category: "safety",
      summary: "Stay safe at work and understand your rights and duties.",
      durationLabel: "4 sessions",
      outcomes: ["Hazard awareness", "PPE", "Reporting incidents"],
      displayOrder: 8,
    },
    {
      slug: "computer-fundamentals",
      title: "Computer Fundamentals",
      category: "digital_literacy",
      summary: "Get comfortable with computers, files and the internet.",
      durationLabel: "6 sessions",
      outcomes: ["Files & folders", "Email", "Safe browsing"],
      displayOrder: 9,
    },
    {
      slug: "wpln",
      title: "WPLN — Workplace Literacy & Numeracy",
      category: "wpln",
      summary: "Improve everyday English and numeracy skills for work.",
      durationLabel: "12 sessions",
      outcomes: ["Workplace English", "Numeracy", "Reading & writing"],
      displayOrder: 10,
    },
  ];
  const insertedCourses = await db
    .insert(course)
    .values(
      courseData.map((c) => ({ ...c, isFree: true, published: true })),
    )
    .returning({ id: course.id, slug: course.slug });

  // ---- Cohorts + sessions for a few courses ----
  await db.delete(cohort);
  const bySlug = new Map(insertedCourses.map((c) => [c.slug, c.id]));
  const cohortRows = [
    {
      courseId: bySlug.get("microsoft-excel")!,
      code: "EXCEL-2026-B12",
      status: "registration_open" as const,
      deliveryMode: "in_person" as const,
      locationName: "Aljunied Community Hub",
      startDate: daysFromNow(14),
      endDate: daysFromNow(42),
      capacity: 30,
    },
    {
      courseId: bySlug.get("public-speaking")!,
      code: "SPEAK-2026-B04",
      status: "registration_open" as const,
      deliveryMode: "hybrid" as const,
      locationName: "Online + Little India",
      startDate: daysFromNow(21),
      endDate: daysFromNow(56),
      capacity: 25,
    },
    {
      courseId: bySlug.get("wpln")!,
      code: "WPLN-2026-B07",
      status: "waitlist_only" as const,
      deliveryMode: "in_person" as const,
      locationName: "Tuas Dormitory Learning Room",
      startDate: daysFromNow(30),
      endDate: daysFromNow(120),
      capacity: 20,
    },
  ];
  const insertedCohorts = await db
    .insert(cohort)
    .values(cohortRows)
    .returning({ id: cohort.id });

  await db.delete(cohortSession);
  for (const c of insertedCohorts) {
    await db.insert(cohortSession).values(
      [0, 1, 2].map((i) => ({
        cohortId: c.id,
        sequence: i + 1,
        title: `Session ${i + 1}`,
        startsAt: daysFromNow(14 + i * 7),
      })),
    );
  }

  // ---- Events ----
  await db.delete(event);
  await db.insert(event).values([
    {
      slug: "blood-donation-drive-2026-2",
      title: "24Asia 2026 2nd Blood Donation Drive",
      category: "blood_donation",
      status: "registration_open",
      description: "Join us to donate blood and help save lives.",
      startsAt: daysFromNow(18, 9),
      endsAt: daysFromNow(18, 17),
      locationName: "HSA Bloodbank @ HSA",
      whatToBring: "Photo ID / Work Permit. Eat well before donating.",
    },
    {
      slug: "annual-beach-clean-up-2026",
      title: "24Asia's Annual Beach Clean-Up",
      category: "environment",
      status: "registration_open",
      description: "Help keep our beaches clean. Gloves and bags provided.",
      startsAt: daysFromNow(25, 8),
      endsAt: daysFromNow(25, 12),
      locationName: "Pasir Ris Beach",
      whatToBring: "Hat, water bottle, sunscreen.",
    },
    {
      slug: "iftar-party-2026",
      title: "24Asia Iftar Party 2026",
      category: "culture",
      status: "published",
      description: "Community iftar gathering, all are welcome.",
      startsAt: daysFromNow(40, 18),
      locationName: "Community Hall",
    },
    {
      slug: "badminton-tournament-2026",
      title: "Badminton Tournament 2026",
      category: "sport",
      status: "published",
      description: "Friendly badminton tournament for our volunteers and members.",
      startsAt: daysFromNow(50, 9),
      locationName: "OCBC Arena",
    },
  ]);

  // ---- Volunteer opportunities ----
  await db.delete(opportunity);
  await db.insert(opportunity).values([
    {
      slug: "training-assistant",
      title: "Training Assistant",
      purpose: "Support trainers during weekend classes.",
      duties: "Help learners, set up the room, mark attendance.",
      commitment: "Weekends, 3 hours",
      riskLevel: "low",
      published: true,
      skillsRequired: ["Patience", "Basic computer skills"],
    },
    {
      slug: "event-crew",
      title: "Event Crew",
      purpose: "Help run community events smoothly.",
      duties: "Registration desk, logistics, crowd guidance.",
      commitment: "Per event",
      riskLevel: "low",
      published: true,
      skillsRequired: ["Teamwork"],
    },
    {
      slug: "trainer-excel",
      title: "Volunteer Trainer — Excel",
      purpose: "Teach Microsoft Excel to migrant learners.",
      duties: "Deliver sessions, prepare materials, give feedback.",
      commitment: "8-week cohort",
      riskLevel: "medium",
      requiresTraining: true,
      published: true,
      skillsRequired: ["Excel proficiency", "Teaching"],
    },
  ]);

  // ---- Trusted services + urgent help ----
  await db.delete(service);
  await db.insert(service).values([
    {
      name: "National mindline 1771",
      topic: "wellbeing",
      description: "Round-the-clock mental health support in Singapore.",
      contactPhone: "1771",
      isUrgentHelp: true,
      published: true,
      verifiedAt: new Date(),
      languages: ["en"],
      cost: "Free",
      operatingHours: "24/7",
    },
    {
      name: "Emergency (Ambulance / Fire)",
      topic: "health",
      description: "For medical emergencies and fire.",
      contactPhone: "995",
      isUrgentHelp: true,
      published: true,
      verifiedAt: new Date(),
      cost: "Free",
      operatingHours: "24/7",
    },
    {
      name: "Police",
      topic: "wellbeing",
      description: "For emergencies requiring police.",
      contactPhone: "999",
      isUrgentHelp: true,
      published: true,
      verifiedAt: new Date(),
      cost: "Free",
      operatingHours: "24/7",
    },
    {
      name: "MOM — Foreign worker assistance",
      topic: "career",
      description:
        "Ministry of Manpower resources and helpline for work-pass holders.",
      contactUrl: "https://www.mom.gov.sg",
      isUrgentHelp: false,
      published: true,
      verifiedAt: new Date(),
      cost: "Free",
    },
  ]);

  // ---- Live show episodes (sample) ----
  await db.delete(liveShowEpisode);
  await db.insert(liveShowEpisode).values(
    [154, 153, 152, 151, 150, 149].map((n) => ({
      episodeNumber: n,
      title: `24Asia Live — Episode ${n}`,
      description: "Community stories, talent and conversations.",
      airedAt: daysFromNow(-(154 - n) * 7),
      published: true,
    })),
  );

  // ---- Partners + awards (public) ----
  await db.delete(partner);
  await db.insert(partner).values(
    ["A Good Space", "SamaSama", "Home4all", "HYC", "NUS", "SMU"].map(
      (name, i) => ({
        name,
        type: "institution",
        verified: true,
        displayPublicly: true,
        displayOrder: i,
      }),
    ),
  );

  await db.delete(award);
  await db.insert(award).values([
    {
      title: "Community Impact Recognition",
      awardedBy: "Community Partner",
      year: 2025,
      displayOrder: 1,
    },
  ]);

  // ---- Enable all capabilities by default (company toggles in admin) ----
  await db.update(featureFlag).set({ enabled: true });

  // ---- Campaign (fundraising) ----
  await db.delete(campaign);
  await db.insert(campaign).values([
    {
      slug: "free-training-fund-2026",
      title: "Free Training Fund 2026",
      description: "Help us train 2,000 more migrant workers this year.",
      goalAmountCents: 5000000,
      raisedAmountCents: 1200000,
      currency: "SGD",
      active: true,
    },
  ]);

  // ---- Shop products + variants ----
  await db.delete(product);
  const [tshirt] = await db
    .insert(product)
    .values({
      slug: "24asia-volunteer-tshirt",
      name: "24Asia Volunteer T-Shirt",
      description: "Soft cotton tee in 24Asia green. Proceeds fund free training.",
      priceCents: 1500,
      published: true,
    })
    .returning({ id: product.id });
  await db.insert(productVariant).values([
    { productId: tshirt.id, sku: "TS-S", label: "S", stock: 40 },
    { productId: tshirt.id, sku: "TS-M", label: "M", stock: 60 },
    { productId: tshirt.id, sku: "TS-L", label: "L", stock: 50 },
    { productId: tshirt.id, sku: "TS-XL", label: "XL", stock: 30 },
  ]);

  // ---- Community group ----
  await db.delete(group);
  await db.insert(group).values([
    {
      slug: "new-arrivals",
      name: "New Arrivals Support",
      purpose: "A friendly space for workers new to Singapore to ask questions.",
      rules: "Be kind. No sharing of personal contact details. English or your language welcome.",
      preModerate: true,
      active: true,
    },
    {
      slug: "skills-study-group",
      name: "Skills Study Group",
      purpose: "Practise together between training sessions.",
      preModerate: false,
      active: true,
    },
  ]);

  // ---- Career opportunity listing ----
  await db.delete(opportunityListing);
  await db.insert(opportunityListing).values([
    {
      title: "Warehouse Assistant (Verified Employer)",
      description: "Full-time role with a 24Asia-verified logistics partner.",
      roleType: "job",
      compensation: "As per MOM guidelines",
      eligibility: "Valid work pass",
      accountableContact: "careers@partner.example",
      feeDeclaration: "No fees charged to workers.",
      verified: true,
      published: true,
    },
  ]);

  // ---- Assessment for the Excel course ----
  await db.delete(assessment);
  const excel = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.slug, "microsoft-excel"))
    .limit(1);
  if (excel[0]) {
    const [a] = await db
      .insert(assessment)
      .values({
        courseId: excel[0].id,
        title: "Excel Basics Quiz",
        type: "quiz",
        passMark: 60,
        published: true,
      })
      .returning({ id: assessment.id });
    await db.insert(assessmentQuestion).values([
      {
        assessmentId: a.id,
        sequence: 1,
        prompt: "Which symbol starts a formula in Excel?",
        choices: ["=", "+", "#", "@"],
        correctIndex: 0,
      },
      {
        assessmentId: a.id,
        sequence: 2,
        prompt: "Which function adds a range of numbers?",
        choices: ["AVERAGE", "SUM", "COUNT", "MAX"],
        correctIndex: 1,
      },
      {
        assessmentId: a.id,
        sequence: 3,
        prompt: "How do you make text bold?",
        choices: ["Ctrl+I", "Ctrl+U", "Ctrl+B", "Ctrl+K"],
        correctIndex: 2,
      },
    ]);
  }

  // ---- Learning pathway ----
  await db.delete(learningPath);
  const [path] = await db
    .insert(learningPath)
    .values({
      slug: "office-ready",
      title: "Office Ready",
      description: "Build the core digital skills for office and admin roles.",
      published: true,
      displayOrder: 1,
    })
    .returning({ id: learningPath.id });
  const pathCourses = await db
    .select({ id: course.id, slug: course.slug })
    .from(course);
  const order = ["computer-fundamentals", "microsoft-word", "microsoft-excel", "public-speaking"];
  let seq = 0;
  for (const slug of order) {
    const c = pathCourses.find((x) => x.slug === slug);
    if (c) {
      await db.insert(learningPathStep).values({ pathId: path.id, courseId: c.id, sequence: seq++ });
    }
  }

  // ---- Policy ----
  await db.delete(policy);
  await db.insert(policy).values([
    {
      slug: "volunteer-code-of-conduct",
      title: "Volunteer Code of Conduct",
      body: "All volunteers commit to safety, respect, confidentiality and integrity.",
      version: "1.0",
      effectiveAt: new Date(),
      published: true,
    },
  ]);

  console.log("Seed complete ✓");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
