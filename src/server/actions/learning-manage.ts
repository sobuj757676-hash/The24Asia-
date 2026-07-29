"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { db } from "@/db";
import {
  assessment,
  assessmentQuestion,
  learningMaterial,
  learningPath,
  learningPathStep,
  certificate,
  enrollment,
  cohort,
  course,
  person,
} from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notify/notifications";
import { slugify } from "@/lib/utils";

const codeGen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

function s(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function n(fd: FormData, k: string) {
  const v = s(fd, k);
  return v ? Number(v) : undefined;
}
function b(fd: FormData, k: string) {
  return fd.get(k) === "on";
}

/* --------------------------------------------------------- Assessments */

export async function saveAssessment(fd: FormData) {
  const staff = await requirePermission("course:manage");
  const id = s(fd, "id");
  const courseId = s(fd, "courseId");
  const title = s(fd, "title");
  if (!courseId || !title) return;
  const values = {
    courseId,
    title,
    type: (s(fd, "type") as never) ?? ("quiz" as never),
    passMark: n(fd, "passMark") ?? 60,
    maxAttempts: n(fd, "maxAttempts") ?? 3,
    published: b(fd, "published"),
  };
  if (id) await db.update(assessment).set(values).where(eq(assessment.id, id));
  else await db.insert(assessment).values(values);
  await audit({ actorId: staff.personId, action: id ? "assessment.updated" : "assessment.created", objectType: "assessment", objectId: id });
  revalidatePath("/admin/programs/assessments");
}

export async function addQuestion(fd: FormData) {
  const staff = await requirePermission("course:manage");
  const assessmentId = s(fd, "assessmentId");
  const prompt = s(fd, "prompt");
  if (!assessmentId || !prompt) return;
  const choices = [s(fd, "choice0"), s(fd, "choice1"), s(fd, "choice2"), s(fd, "choice3")].filter(
    Boolean,
  ) as string[];
  await db.insert(assessmentQuestion).values({
    assessmentId,
    prompt,
    choices,
    correctIndex: n(fd, "correctIndex") ?? 0,
    points: n(fd, "points") ?? 1,
    sequence: n(fd, "sequence") ?? 0,
  });
  await audit({ actorId: staff.personId, action: "assessment_question.created", objectType: "assessment", objectId: assessmentId });
  revalidatePath("/admin/programs/assessments");
}

export async function deleteAssessment(id: string) {
  const staff = await requirePermission("course:manage");
  await db.delete(assessment).where(eq(assessment.id, id));
  await audit({ actorId: staff.personId, action: "assessment.deleted", objectType: "assessment", objectId: id });
  revalidatePath("/admin/programs/assessments");
}

/* ------------------------------------------------------------ Materials */

export async function saveMaterial(fd: FormData) {
  const staff = await requirePermission("course:manage");
  const courseId = s(fd, "courseId");
  const title = s(fd, "title");
  if (!courseId || !title) return;
  await db.insert(learningMaterial).values({
    courseId,
    title,
    description: s(fd, "description"),
    url: s(fd, "url"),
    downloadable: b(fd, "downloadable"),
    offlineAllowed: b(fd, "offlineAllowed"),
    displayOrder: n(fd, "displayOrder") ?? 0,
  });
  await audit({ actorId: staff.personId, action: "learning_material.created", objectType: "course", objectId: courseId });
  revalidatePath("/admin/programs/materials");
}

export async function deleteMaterial(id: string) {
  const staff = await requirePermission("course:manage");
  await db.delete(learningMaterial).where(eq(learningMaterial.id, id));
  await audit({ actorId: staff.personId, action: "learning_material.deleted", objectType: "learning_material", objectId: id });
  revalidatePath("/admin/programs/materials");
}

/* ------------------------------------------------------------- Pathways */

export async function savePathway(fd: FormData) {
  const staff = await requirePermission("course:manage");
  const id = s(fd, "id");
  const title = s(fd, "title");
  if (!title) return;
  const values = {
    title,
    slug: s(fd, "slug") || slugify(title),
    description: s(fd, "description"),
    published: b(fd, "published"),
    displayOrder: n(fd, "displayOrder") ?? 0,
  };
  if (id) await db.update(learningPath).set(values).where(eq(learningPath.id, id));
  else await db.insert(learningPath).values(values);
  await audit({ actorId: staff.personId, action: id ? "learning_path.updated" : "learning_path.created", objectType: "learning_path", objectId: id });
  revalidatePath("/admin/programs/pathways");
  revalidatePath("/learn/pathways");
}

export async function addPathStep(fd: FormData) {
  const staff = await requirePermission("course:manage");
  const pathId = s(fd, "pathId");
  const courseId = s(fd, "courseId");
  if (!pathId || !courseId) return;
  await db
    .insert(learningPathStep)
    .values({ pathId, courseId, sequence: n(fd, "sequence") ?? 0 })
    .onConflictDoNothing();
  revalidatePath("/admin/programs/pathways");
}

/* --------------------------------------------------------- Certificates */

/** Issue a verifiable certificate for an enrollment (PRD LMS-011). */
export async function issueCertificate(enrollmentId: string) {
  const staff = await requirePermission("certificate:issue");
  const rows = await db
    .select({
      enrollmentId: enrollment.id,
      personId: enrollment.personId,
      courseTitle: course.title,
      recipientName: person.displayName,
    })
    .from(enrollment)
    .innerJoin(cohort, eq(enrollment.cohortId, cohort.id))
    .innerJoin(course, eq(cohort.courseId, course.id))
    .innerJoin(person, eq(enrollment.personId, person.id))
    .where(eq(enrollment.id, enrollmentId))
    .limit(1);
  const e = rows[0];
  if (!e) return;

  const existing = await db
    .select({ id: certificate.id })
    .from(certificate)
    .where(eq(certificate.enrollmentId, enrollmentId))
    .limit(1);
  if (existing[0]) return;

  const code = `24A-${new Date().getFullYear()}-${codeGen()}`;
  await db.insert(certificate).values({
    enrollmentId,
    personId: e.personId,
    courseTitle: e.courseTitle,
    recipientName: e.recipientName ?? "24Asia Learner",
    verificationCode: code,
  });
  await db
    .update(enrollment)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(enrollment.id, enrollmentId));

  await notify({
    personId: e.personId,
    templateKey: "certificate.issued",
    title: "Your certificate is ready",
    body: `Certificate for ${e.courseTitle}`,
    linkUrl: "/account/certificates",
  });

  await audit({ actorId: staff.personId, action: "certificate.issued", objectType: "certificate", objectId: code });
  revalidatePath("/admin/programs/certificates");
}

export async function revokeCertificate(id: string) {
  const staff = await requirePermission("certificate:issue");
  await db.update(certificate).set({ revokedAt: new Date() }).where(eq(certificate.id, id));
  await audit({ actorId: staff.personId, action: "certificate.revoked", objectType: "certificate", objectId: id });
  revalidatePath("/admin/programs/certificates");
}
