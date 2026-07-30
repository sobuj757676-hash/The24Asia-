"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { Loader2, Mail, Smartphone, KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "request" | "verify";
type Method = "email" | "phone" | "password";

const RESEND_SECONDS = 30;

export function SignInForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirect") || "/dashboard";

  const [method, setMethod] = useState<Method>("email");
  const [step, setStep] = useState<Step>("request");
  const [target, setTarget] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  // Countdown for "resend code" so users are not left guessing whether the
  // code is still coming, and we do not hammer the OTP endpoint.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (step === "verify") codeRef.current?.focus();
  }, [step]);

  function switchMethod(next: Method) {
    setMethod(next);
    setStep("request");
    setError(null);
    setCode("");
  }

  async function sendCode(isResend = false) {
    setBusy(true);
    setError(null);
    try {
      if (method === "phone") {
        const { error: err } = await authClient.phoneNumber.sendOtp({
          phoneNumber: target,
        });
        if (err) throw err;
      } else {
        const { error: err } = await authClient.emailOtp.sendVerificationOtp({
          email: target,
          type: "sign-in",
        });
        if (err) throw err;
      }
      setStep("verify");
      setCooldown(RESEND_SECONDS);
      toast.success(t("codeSent", { target }));
      if (isResend) codeRef.current?.focus();
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    await sendCode();
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (method === "phone") {
        const { error: err } = await authClient.phoneNumber.verify({
          phoneNumber: target,
          code,
        });
        if (err) throw err;
      } else {
        const { error: err } = await authClient.signIn.emailOtp({
          email: target,
          otp: code,
        });
        if (err) throw err;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(t("invalidCode"));
      setBusy(false);
    }
  }

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await authClient.signIn.email({
        email: target,
        password,
      });
      if (err) throw err;
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("That email and password combination is not correct.");
      setBusy(false);
    }
  }

  const errorRegion = (
    <div aria-live="polite">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-danger-fg dark:border-red-800 dark:bg-red-900/20"
        >
          {error}
        </p>
      )}
    </div>
  );

  return (
    <Section>
      <Container className="max-w-md">
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white">
            24
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
            {t("signInTitle")}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {method === "password"
              ? "Enter the email and password for your account."
              : t("signInIntro")}
          </p>
        </div>

        {/* Method switcher — one visible control instead of scattered text links */}
        {step === "request" && (
          <div
            role="tablist"
            aria-label="Sign-in method"
            className="mt-6 grid grid-cols-3 gap-1 rounded-xl bg-ink-100 p-1 dark:bg-ink-800"
          >
            {(
              [
                { key: "email", label: t("email"), icon: <Mail className="size-4" /> },
                { key: "phone", label: t("phone"), icon: <Smartphone className="size-4" /> },
                { key: "password", label: "Password", icon: <KeyRound className="size-4" /> },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={method === m.key}
                onClick={() => switchMethod(m.key)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors",
                  method === m.key
                    ? "bg-[var(--card)] text-brand-700 shadow-sm dark:text-brand-300"
                    : "text-ink-600 hover:text-ink-900 dark:text-ink-300",
                )}
              >
                {m.icon}
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>
        )}

        <Card className="mt-4">
          <CardBody>
            {method === "password" ? (
              <form onSubmit={signInPassword} className="space-y-4" noValidate>
                {errorRegion}
                <Field label={t("email")} htmlFor="pw-email" required>
                  <Input
                    id="pw-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </Field>
                <Field label="Password" htmlFor="pw" required>
                  <Input
                    id="pw"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <Button type="submit" disabled={busy} aria-busy={busy} className="w-full">
                  {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  {busy ? "Signing in…" : t("signInTitle")}
                </Button>
              </form>
            ) : step === "request" ? (
              <form onSubmit={requestCode} className="space-y-4" noValidate>
                {errorRegion}
                {method === "email" ? (
                  <Field
                    label={t("email")}
                    htmlFor="target"
                    hint="We'll send a 6-digit code to this address."
                    required
                  >
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
                  <Field
                    label={t("phone")}
                    htmlFor="target"
                    hint="Include the country code, e.g. +65 8123 4567."
                    required
                  >
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
                <Button type="submit" disabled={busy} aria-busy={busy} className="w-full">
                  {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  {busy ? "Sending…" : t("sendCode")}
                </Button>
              </form>
            ) : (
              <form onSubmit={verify} className="space-y-4" noValidate>
                {errorRegion}
                <p className="text-sm text-[var(--muted)]">
                  {t("codeSent", { target })}
                </p>
                <Field label={t("enterCode")} htmlFor="code" required>
                  <Input
                    ref={codeRef}
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-2xl tracking-[0.4em]"
                  />
                </Field>
                <Button
                  type="submit"
                  disabled={busy || code.length < 6}
                  aria-busy={busy}
                  className="w-full"
                >
                  {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  {busy ? "Checking…" : t("verify")}
                </Button>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep("request");
                      setError(null);
                    }}
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    Change {method === "phone" ? "number" : "email"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy || cooldown > 0}
                    onClick={() => sendCode(true)}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        <p className="mt-5 flex items-start gap-2 text-xs text-[var(--muted)]">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          <span>
            No account yet? Signing in with your email or phone creates one
            automatically. We only use your details to run the services you ask for —
            see our{" "}
            <Link href="/policies" className="font-medium underline">
              privacy policy
            </Link>
            .
          </span>
        </p>
      </Container>
    </Section>
  );
}
