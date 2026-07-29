import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, phoneNumber, twoFactor, admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { sendOtp } from "@/lib/notify/otp";

/**
 * better-auth server instance (PRD 8.1 identity).
 * - email + phone OTP: low-friction verification; migrant users often prefer
 *   phone over email (PRD IAM-002).
 * - twoFactor: staff MFA (PRD IAM-007). SMS must not be the only factor.
 * - admin: role/ban management.
 *
 * Account enumeration protection and rate limiting are enabled (PRD IAM-009).
 */
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      twoFactor: schema.twoFactor,
    },
    usePlural: false,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // OTP flow handles verification
    minPasswordLength: 8,
  },
  account: {
    accountLinking: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  advanced: {
    // non-sequential ids everywhere (PRD 12.3)
    database: { generateId: () => crypto.randomUUID() },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtp({ channel: "email", to: email, otp, type });
      },
    }),
    phoneNumber({
      otpLength: 6,
      expiresIn: 600,
      async sendOTP({ phoneNumber: to, code }) {
        await sendOtp({ channel: "sms", to, otp: code, type: "sign-in" });
      },
      signUpOnVerification: {
        getTempEmail: (phone) => `${phone.replace(/[^0-9]/g, "")}@phone.24asia.local`,
        getTempName: (phone) => phone,
      },
    }),
    twoFactor({
      issuer: "24Asia",
    }),
    admin(),
    nextCookies(), // keep last
  ],
});

export type Session = typeof auth.$Infer.Session;
