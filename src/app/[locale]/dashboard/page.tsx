import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { landingPath } from "@/lib/auth/panels";

export const metadata = { robots: { index: false } };

/**
 * Post-login router: sends each user to the most relevant panel for their role
 * (admin → /admin, partner → /partner-portal, volunteer → /volunteer-portal,
 * otherwise the personal account hub).
 */
export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/dashboard");
  redirect(landingPath(user));
}
