import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPublishedAssessment } from "@/server/queries/learning";
import { submitAttempt } from "@/server/actions/assess";
import { Button } from "@/components/ui/button";

export const metadata = { robots: { index: false } };

export default async function TakeAssessment({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const data = await getPublishedAssessment(id);
  if (!data) notFound();
  const { assessment, questions } = data;
  const action = submitAttempt.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{assessment.title}</h1>
        <p className="text-[var(--muted)]">
          Pass mark {assessment.passMark}%. Choose the best answer for each question.
        </p>
      </div>
      <form action={action} className="space-y-6">
        {questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-2xl border bg-[var(--card)] p-4">
            <legend className="px-1 font-medium">
              {i + 1}. {q.prompt}
            </legend>
            <div className="mt-2 space-y-2">
              {(q.choices as string[]).map((choice, ci) => (
                <label key={ci} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                  <input type="radio" name={`q_${q.id}`} value={ci} required className="size-4" />
                  {choice}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {questions.length === 0 ? (
          <p className="text-[var(--muted)]">This assessment has no questions yet.</p>
        ) : (
          <Button type="submit" size="lg">Submit answers</Button>
        )}
      </form>
    </div>
  );
}
