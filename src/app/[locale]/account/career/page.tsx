import { setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { myGoals, myMatches, isMentor } from "@/server/queries/support";
import { addGoal, requestMentorship, registerMentor } from "@/server/actions/career";

export default async function AccountCareer({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [goals, matches, mentor] = await Promise.all([
    myGoals(user.personId),
    myMatches(user.personId),
    isMentor(user.personId),
  ]);

  async function saveGoal(fd: FormData) {
    "use server";
    await addGoal(fd);
    revalidatePath("/account/career");
  }
  async function reqMentor(fd: FormData) {
    "use server";
    await requestMentorship(fd);
    revalidatePath("/account/career");
  }
  async function becomeMentor(fd: FormData) {
    "use server";
    await registerMentor(fd);
    revalidatePath("/account/career");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Career & mentorship</h1>

      <section>
        <h2 className="mb-3 text-lg font-bold">My goals</h2>
        <Card>
          <CardBody>
            <form action={saveGoal} className="flex flex-wrap items-end gap-3">
              <Field label="New goal" htmlFor="title">
                <Input id="title" name="title" placeholder="e.g. Learn Excel for office work" className="w-64" />
              </Field>
              <Button type="submit" size="sm" variant="outline">Add goal</Button>
            </form>
            <ul className="mt-4 space-y-2">
              {goals.map((g) => (
                <li key={g.id} className="flex items-center justify-between border-b py-2 text-sm">
                  <span>{g.title}</span>
                  <Badge tone={g.status === "achieved" ? "success" : "neutral"}>{g.status}</Badge>
                </li>
              ))}
              {goals.length === 0 && <EmptyState title="No goals yet" />}
            </ul>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Mentorship</h2>
        <Card>
          <CardBody className="space-y-4">
            <form action={reqMentor} className="flex flex-wrap items-end gap-3">
              <Field label="Request a mentor" htmlFor="topic">
                <Input id="topic" name="topic" placeholder="What do you want guidance on?" className="w-72" />
              </Field>
              <Button type="submit" size="sm">Request mentorship</Button>
            </form>
            <ul className="space-y-2">
              {matches.map((m) => (
                <li key={m.id} className="flex items-center justify-between border-b py-2 text-sm">
                  <span>{m.topic ?? "Mentorship"}</span>
                  <Badge tone={m.status === "active" || m.status === "matched" ? "success" : "neutral"}>{m.status}</Badge>
                </li>
              ))}
              {matches.length === 0 && <p className="text-sm text-[var(--muted)]">No mentorship requests yet.</p>}
            </ul>
          </CardBody>
        </Card>
      </section>

      {!mentor && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Become a mentor</h2>
          <Card>
            <CardBody>
              <form action={becomeMentor} className="grid gap-3 sm:grid-cols-2">
                <Field label="Expertise (comma separated)" htmlFor="expertise">
                  <Input id="expertise" name="expertise" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Short bio" htmlFor="bio">
                    <Textarea id="bio" name="bio" />
                  </Field>
                </div>
                <div><Button type="submit" size="sm" variant="outline">Register as mentor</Button></div>
              </form>
            </CardBody>
          </Card>
        </section>
      )}
    </div>
  );
}
