import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import {
  getMyVolunteerProfile,
  getMyHours,
  getMyShifts,
  getMyRecognition,
} from "@/server/queries/portal";

export default async function VolunteerDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();

  const [profile, hours, shifts, recognitions] = await Promise.all([
    getMyVolunteerProfile(user.personId),
    getMyHours(user.personId),
    getMyShifts(user.personId),
    getMyRecognition(user.personId),
  ]);

  const approvedHours = hours
    .filter((h) => h.approved)
    .reduce((sum, h) => sum + Number(h.hours), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t("volunteerDashboard")}</h1>
        {profile ? (
          <Badge tone="brand">{profile.standing}</Badge>
        ) : (
          <Badge>Not yet a volunteer</Badge>
        )}
      </div>

      {!profile && (
        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <p className="text-sm">
              You are not an approved volunteer yet. Browse opportunities to
              apply.
            </p>
            <Button asChild size="sm">
              <Link href="/volunteer">Opportunities</Link>
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Handbook nudge (VOL-005) */}
      {profile && !profile.handbookAcknowledgedAt && (
        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <p className="text-sm">
              Please acknowledge the volunteer handbook & code of conduct.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/volunteer-portal/profile">Review & acknowledge</Link>
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-3xl font-bold text-brand-600">{approvedHours}</p>
            <p className="text-sm text-[var(--muted)]">Approved hours</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-3xl font-bold text-brand-600">{shifts.length}</p>
            <p className="text-sm text-[var(--muted)]">{t("myShifts")}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-3xl font-bold text-brand-600">{recognitions.length}</p>
            <p className="text-sm text-[var(--muted)]">Recognitions</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-3xl font-bold text-brand-600">
              {profile?.team ?? "—"}
            </p>
            <p className="text-sm text-[var(--muted)]">Team</p>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link href="/volunteer-portal/shifts">Find shifts</Link></Button>
        <Button asChild size="sm" variant="outline"><Link href="/volunteer-portal/hours">Log hours</Link></Button>
        <Button asChild size="sm" variant="outline"><Link href="/volunteer-portal/report">Report a concern</Link></Button>
      </div>
    </div>
  );
}
