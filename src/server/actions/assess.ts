"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  assessment,
  assessmentQuestion,
  assessmentAttempt,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

/**
 * Grades and records an assessment attempt (PRD LMS-010). Multiple-choice
 * questions are graded server-side; the pass mark comes from the assessment.
 */
export async function submitAttempt(assessmentId: string, formData: FormData) {
  const user = await requireUser();

  const [a] = await db
    .select()
    .from(assessment)
    .where(eq(assessment.id, assessmentId))
    .limit(1);
  if (!a) redirect("/account/courses");

  const questions = await db
    .select()
    .from(assessmentQuestion)
    .where(eq(assessmentQuestion.assessmentId, assessmentId))
    .orderBy(assessmentQuestion.sequence);

  let earned = 0;
  let total = 0;
  const answers: Record<string, number> = {};
  for (const q of questions) {
    total += q.points;
    const picked = Number(formData.get(`q_${q.id}`));
    answers[q.id] = Number.isFinite(picked) ? picked : -1;
    if (picked === q.correctIndex) earned += q.points;
  }
  const scorePercent = total > 0 ? Math.round((earned / total) * 100) : 0;
  const passed = scorePercent >= a.passMark;

  await db.insert(assessmentAttempt).values({
    assessmentId,
    personId: user.personId,
    status: passed ? "passed" : "failed",
    scorePercent,
    answers,
    submittedAt: new Date(),
  });

  await audit({
    actorId: user.personId,
    action: passed ? "assessment.passed" : "assessment.failed",
    objectType: "assessment",
    objectId: assessmentId,
    context: { scorePercent },
  });

  redirect(`/account/assessments/${assessmentId}/result?score=${scorePercent}&passed=${passed}`);
}

/** Attempts a learner has already used for an assessment. */
export async function countAttempts(assessmentId: string, personId: string) {
  const rows = await db
    .select({ id: assessmentAttempt.id })
    .from(assessmentAttempt)
    .where(
      and(
        eq(assessmentAttempt.assessmentId, assessmentId),
        eq(assessmentAttempt.personId, personId),
      ),
    );
  return rows.length;
}
