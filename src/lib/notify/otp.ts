import { env, isDev } from "@/env";

type OtpArgs = {
  channel: "email" | "sms";
  to: string;
  otp: string;
  type: string;
};

/**
 * Sends a one-time passcode. In development (or when no provider is
 * configured) it logs to the server console so the flow is testable without
 * external services. Wire Resend / an SMS provider (PRD 24) for production.
 * OTP copy is deliberately discreet (PRD MSG-004).
 */
export async function sendOtp({ channel, to, otp, type }: OtpArgs) {
  const message = `Your 24Asia verification code is ${otp}. It expires in 10 minutes.`;

  if (isDev || (!env.RESEND_API_KEY && channel === "email")) {
    console.info(
      `\n[OTP:${channel}] to=${to} type=${type}\n  ${message}\n`,
    );
    return;
  }

  if (channel === "email" && env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to,
        subject: "Your 24Asia verification code",
        text: message,
      }),
    }).catch((e) => {
      console.error("[OTP] email send failed", e);
    });
    return;
  }

  // SMS provider not configured yet (PRD 24.2 P1). Log so dev flow works.
  console.info(`[OTP:sms:fallback] to=${to} ${message}`);
}
