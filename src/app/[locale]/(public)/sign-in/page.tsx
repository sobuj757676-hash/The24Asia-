import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
