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
  if (!a || !a.published) redirect("/account/assessments");

  // `maxAttempts` was stored and displayed but never enforced, so a learner
  // could submit the same quiz indefinitely until they passed. Count prior
  // attempts and stop at the configured limit.
  const prior = await db
    .select({ status: assessmentAttempt.status })
    .from(assessmentAttempt)
    .where(
      and(
        eq(assessmentAttempt.assessmentId, assessmentId),
        eq(assessmentAttempt.personId, user.personId),
      ),
    );
  if (prior.some((p) => p.status === "passed")) {
    // Already passed: nothing to gain from another attempt.
    redirect(`/account/assessments/${assessmentId}/result`);
  }
  if (prior.length >= a.maxAttempts) {
    redirect(`/account/assessments?error=no_attempts_left`);
  }

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

  // The result page reads the recorded attempt, so no score is passed in the URL.
  redirect(`/account/assessments/${assessmentId}/result`);
}

/*
 * `countAttempts(assessmentId, personId)` used to live here. It had no caller,
 * no authorization check, and — because every export from a "use server" module
 * is a callable endpoint — it let anyone read how many attempts an arbitrary
 * person had made. Removed rather than guarded, since nothing used it.
 */
