"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/misc";
import { toast } from "sonner";

type Step = "request" | "verify";

export function SignInForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirect") || "/account";

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<Step>("request");
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (method === "email") {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: target,
          type: "sign-in",
        });
        if (error) throw error;
      } else {
        const { error } = await authClient.phoneNumber.sendOtp({
          phoneNumber: target,
        });
        if (error) throw error;
      }
      setStep("verify");
      toast.success(t("codeSent", { target }));
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (method === "email") {
        const { error } = await authClient.signIn.emailOtp({
          email: target,
          otp: code,
        });
        if (error) throw error;
      } else {
        const { error } = await authClient.phoneNumber.verify({
          phoneNumber: target,
          code,
        });
        if (error) throw error;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error(t("invalidCode"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section>
      <Container className="max-w-md">
        <h1 className="text-2xl font-extrabold">{t("signInTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("signInIntro")}</p>

        {step === "request" ? (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            {method === "email" ? (
              <Field label={t("email")} htmlFor="target">
                <Input
                  id="target"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </Field>
            ) : (
              <Field label={t("phone")} htmlFor="target" hint="+65…">
                <Input
                  id="target"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </Field>
            )}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "…" : t("sendCode")}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-brand-700"
              onClick={() => setMethod(method === "email" ? "phone" : "email")}
            >
              {method === "email" ? t("usePhone") : t("useEmail")}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-6 space-y-4">
            <Field label={t("enterCode")} htmlFor="code">
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-2xl tracking-widest"
              />
            </Field>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "…" : t("verify")}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-brand-700"
              onClick={() => setStep("request")}
            >
              ← {target}
            </button>
          </form>
        )}
      </Container>
    </Section>
  );
}
